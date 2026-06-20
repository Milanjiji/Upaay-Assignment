const mongoose = require("mongoose");

const SeatStatusSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  status: { type: String, enum: ["available", "occupied"], default: "available" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { _id: false });

const ShowtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD format
      required: true
    },
    time: {
      type: String, // e.g. "10:00 AM"
      required: true
    },
    format: {
      type: String,
      enum: ["2D", "3D"],
      required: true
    },
    screenNumber: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      default: 280
    },
    seats: {
      type: [SeatStatusSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Prevent double-scheduling conflicts on the same theater/screen at the same date & time
ShowtimeSchema.index(
  { theaterId: 1, date: 1, time: 1, screenNumber: 1 },
  { unique: true }
);

// Pre-save middleware to populate seating grid dynamically based on theater configuration
ShowtimeSchema.pre("save", async function (next) {
  if (this.isNew && (!this.seats || this.seats.length === 0)) {
    try {
      const Theater = mongoose.model("Theater");
      const theater = await Theater.findById(this.theaterId);
      if (!theater) {
        throw new Error("Associated theater not found");
      }

      const seatsList = [];
      for (const row of theater.rows) {
        for (let col = 1; col <= theater.colsCount; col++) {
          seatsList.push({
            seatNumber: `${row}-${col}`,
            status: "available",
            userId: null
          });
        }
      }
      this.seats = seatsList;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = mongoose.models.Showtime || mongoose.model("Showtime", ShowtimeSchema);
