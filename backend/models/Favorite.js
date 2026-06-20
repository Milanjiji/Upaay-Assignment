const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

// Prevent user duplicate favorites
FavoriteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
