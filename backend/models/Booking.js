const mongoose = require("mongoose");

const CardDetailsSchema = new mongoose.Schema({
  nameOnCard: { type: String },
  cardNumber: { type: String } // Masked e.g. "**** **** **** 1234"
}, { _id: false });

const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
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
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true
    },
    seats: {
      type: [String],
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    bookingFee: {
      type: Number,
      default: 20
    },
    paymentMethod: {
      type: String,
      enum: ["card", "wallet"],
      default: "card"
    },
    cardDetails: {
      type: CardDetailsSchema,
      default: null
    },
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
