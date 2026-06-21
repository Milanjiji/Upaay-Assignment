const express = require("express");
const router = express.Router();
const Showtime = require("../models/Showtime");
const { verifyAdmin, verifyUser } = require("../middleware/auth");
const { redis } = require("../config/redis");

// GET /api/showtimes - list all showtimes with filters
router.get("/", async (req, res) => {
  try {
    const { movieId, theaterId, date } = req.query;
    const query = {};
    if (movieId) query.movieId = movieId;
    if (theaterId) query.theaterId = theaterId;
    if (date) query.date = date;

    const showtimes = await Showtime.find(query)
      .populate("movieId")
      .populate("theaterId")
      .sort({ date: 1, time: 1 });
      
    res.json(showtimes);
  } catch (error) {
    console.error("Fetch showtimes error:", error);
    res.status(500).json({ message: "Failed to fetch showtimes" });
  }
});

// GET /api/showtimes/:id - get single showtime details with populated models
router.get("/:id", async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate("movieId")
      .populate("theaterId");
      
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const currentUserId = req.headers["x-user-id"] || req.headers["authorization"];

    // Fetch active Redis holds for this showtime
    const holdKeys = await redis.keys(`hold:showtime:${req.params.id}:seat:*`);
    const holdUserMap = new Map();

    if (holdKeys.length > 0) {
      const holdValues = await redis.mget(holdKeys);
      holdKeys.forEach((key, idx) => {
        const parts = key.split(":");
        const seatNumber = parts[parts.length - 1];
        const holderId = holdValues[idx];
        holdUserMap.set(seatNumber, holderId);
      });
    }

    const showtimeObj = showtime.toObject();
    if (showtimeObj.seats) {
      showtimeObj.seats = showtimeObj.seats.map(seat => {
        const holderId = holdUserMap.get(seat.seatNumber);
        if (holderId && holderId !== currentUserId) {
          seat.status = "occupied";
        }
        return seat;
      });
    }

    res.json(showtimeObj);
  } catch (error) {
    console.error("Fetch showtime details error:", error);
    res.status(500).json({ message: "Failed to fetch showtime details" });
  }
});

// POST /api/showtimes/:id/hold - Temporarily lock seats in Redis for 5 minutes (Protected)
router.post("/:id/hold", verifyUser, async (req, res) => {
  try {
    const showtimeId = req.params.id;
    const { seats } = req.body;
    const userId = req.user._id.toString();

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "No seats specified for hold" });
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // 1. Verify seat availability in MongoDB
    const seatMap = new Map(showtime.seats.map(s => [s.seatNumber, s]));
    for (const seatNum of seats) {
      const seat = seatMap.get(seatNum);
      if (!seat) {
        return res.status(400).json({ message: `Seat ${seatNum} is invalid for this showtime` });
      }
      if (seat.status === "occupied") {
        return res.status(409).json({ message: `Seat ${seatNum.replace("-", "")} is already occupied` });
      }
    }

    // 2. Check active Redis holds by other users
    for (const seatNum of seats) {
      const holdKey = `hold:showtime:${showtimeId}:seat:${seatNum}`;
      const holderId = await redis.get(holdKey);
      if (holderId && holderId !== userId) {
        return res.status(409).json({ message: "One or more selected seats are temporarily held by another user. Please choose different seats." });
      }
    }

    // 3. Save hold keys in Redis with 5-minute expiry (300 seconds)
    for (const seatNum of seats) {
      const holdKey = `hold:showtime:${showtimeId}:seat:${seatNum}`;
      await redis.set(holdKey, userId, "EX", 300);
    }

    res.json({ message: "Seats held successfully" });
  } catch (error) {
    console.error("Hold seats error:", error);
    res.status(500).json({ message: "Failed to hold seats" });
  }
});

// POST /api/showtimes/:id/release - Release temporarily held seats from Redis (Protected)
router.post("/:id/release", verifyUser, async (req, res) => {
  try {
    const showtimeId = req.params.id;
    const { seats } = req.body;

    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "No seats specified for release" });
    }

    // Delete hold keys from Redis
    for (const seatNum of seats) {
      const holdKey = `hold:showtime:${showtimeId}:seat:${seatNum}`;
      await redis.del(holdKey);
    }

    res.json({ message: "Seats released successfully" });
  } catch (error) {
    console.error("Release seats error:", error);
    res.status(500).json({ message: "Failed to release seats" });
  }
});

// POST /api/showtimes - create showtime (Admin only)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { movieId, theaterId, date, time, format, price, screenNumber } = req.body;

    if (!movieId || !theaterId || !date || !time || !format || !price) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newShowtime = new Showtime({
      movieId,
      theaterId,
      date,
      time,
      format,
      price,
      screenNumber
    });

    await newShowtime.save();
    res.status(201).json({ message: "Showtime scheduled successfully", showtime: newShowtime });
  } catch (error) {
    console.error("Create showtime error:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Conflict detected: Screen is already scheduled at this time." });
    }
    res.status(500).json({ message: error.message || "Failed to schedule showtime" });
  }
});

// PUT /api/showtimes/:id - update showtime details (Admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedShowtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.json({ message: "Showtime updated successfully", showtime: updatedShowtime });
  } catch (error) {
    console.error("Update showtime error:", error);
    res.status(500).json({ message: "Failed to update showtime" });
  }
});

// DELETE /api/showtimes/:id - delete showtime (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedShowtime = await Showtime.findByIdAndDelete(req.params.id);
    if (!deletedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    res.json({ message: "Showtime deleted successfully" });
  } catch (error) {
    console.error("Delete showtime error:", error);
    res.status(500).json({ message: "Failed to delete showtime" });
  }
});

module.exports = router;
