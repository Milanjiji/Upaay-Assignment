const express = require("express");
const router = express.Router();
const Showtime = require("../models/Showtime");
const { verifyAdmin } = require("../middleware/auth");

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
    res.json(showtime);
  } catch (error) {
    console.error("Fetch showtime details error:", error);
    res.status(500).json({ message: "Failed to fetch showtime details" });
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
