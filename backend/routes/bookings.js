const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Showtime = require("../models/Showtime");
const { verifyUser, verifyAdmin } = require("../middleware/auth");
const { redlock } = require("../config/redis");

// GET /api/bookings - list all bookings (Admin only)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("movieId", "title genre")
      .populate("theaterId", "name location")
      .populate("showtimeId", "date time format")
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error("Fetch all bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings ledger" });
  }
});

// GET /api/bookings/user - list logged-in user's bookings
router.get("/user", verifyUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("movieId", "title genre posterUrl formats rating pgRating")
      .populate("theaterId", "name location rateRange")
      .populate("showtimeId", "date time format price")
      .sort({ createdAt: -1 });
      
    res.json(bookings);
  } catch (error) {
    console.error("Fetch user bookings error:", error);
    res.status(500).json({ message: "Failed to fetch your bookings" });
  }
});

// POST /api/bookings - place a ticket booking
router.post("/", verifyUser, async (req, res) => {
  const { movieId, theaterId, showtimeId, seats, totalPrice, paymentMethod, cardDetails } = req.body;

  if (!movieId || !theaterId || !showtimeId || !seats || seats.length === 0 || !totalPrice) {
    return res.status(400).json({ message: "Required booking information is missing" });
  }

  if (seats.length > 10) {
    return res.status(400).json({ message: "You can select a maximum of 10 seats per transaction." });
  }

  let lock;
  try {
    lock = await redlock.acquire([`locks:showtime:${showtimeId}`], 10000);
  } catch (error) {
    return res.status(409).json({ message: "High traffic: Someone else is currently booking tickets for this show. Please try again in a few seconds." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const showtime = await Showtime.findById(showtimeId).session(session);
    if (!showtime) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Showtime session not found" });
    }

    // Check seat availability
    const seatMap = new Map(showtime.seats.map(s => [s.seatNumber, s]));
    for (const seatNum of seats) {
      const seat = seatMap.get(seatNum);
      if (!seat) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Seat ${seatNum} is invalid for this theater layout` });
      }
      if (seat.status === "occupied") {
        await session.abortTransaction();
        return res.status(400).json({ message: `Seat ${seatNum.replace("-", "")} is already occupied` });
      }
    }

    // Reserve seats in Showtime document
    for (const seatNum of seats) {
      await Showtime.updateOne(
        { _id: showtimeId, "seats.seatNumber": seatNum },
        { 
          $set: { 
            "seats.$.status": "occupied", 
            "seats.$.userId": req.user._id 
          } 
        },
        { session }
      );
    }

    // Save Booking transaction record
    const newBookings = await Booking.create([{
      userId: req.user._id,
      movieId,
      theaterId,
      showtimeId,
      seats,
      totalPrice,
      paymentMethod,
      cardDetails
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ message: "Booking placed successfully", booking: newBookings[0] });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Failed to place booking" });
  } finally {
    session.endSession();
    if (lock) {
      try {
        await lock.release();
      } catch (err) {
        console.error("Failed to release lock:", err);
      }
    }
  }
});

// DELETE /api/bookings/:id - cancel a booking (release seats)
router.delete("/:id", verifyUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // User check: Owner or admin only
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. You cannot cancel this booking." });
    }

    // Release seats in Showtime document
    for (const seatNum of booking.seats) {
      await Showtime.updateOne(
        { _id: booking.showtimeId, "seats.seatNumber": seatNum },
        { 
          $set: { 
            "seats.$.status": "available", 
            "seats.$.userId": null 
          } 
        }
      );
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

module.exports = router;
