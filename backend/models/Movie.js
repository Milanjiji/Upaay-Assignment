const mongoose = require("mongoose");

const CastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  character: { type: String, required: true },
  image: { type: String, required: true }
});

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    genre: {
      type: String,
      required: [true, "Genre is required"]
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    pgRating: {
      type: String,
      default: "PG-13"
    },
    description: {
      type: String
    },
    formats: {
      type: [String],
      required: true
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"]
    },
    showingType: {
      type: String,
      required: true,
      enum: ["now_showing", "coming_soon"]
    },
    posterUrl: {
      type: String,
      default: "/assets/home/Hero Image.png"
    },
    cast: {
      type: [CastSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Movie || mongoose.model("Movie", MovieSchema);
