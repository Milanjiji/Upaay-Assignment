const mongoose = require("mongoose");

const TheaterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Theater name is required"],
      trim: true
    },
    location: {
      type: String,
      required: [true, "Location is required"]
    },
    rateRange: {
      type: String,
      required: [true, "Rate range is required"]
    },
    imageUrl: {
      type: String,
      default: "/assets/home/Hero Image.png"
    },
    rows: {
      type: [String],
      required: true,
      default: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"]
    },
    colsCount: {
      type: Number,
      required: true,
      default: 30
    },
    verticalAisles: {
      type: [Number],
      default: [10, 20]
    },
    horizontalAisles: {
      type: [String],
      default: ["J"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Theater || mongoose.model("Theater", TheaterSchema);
