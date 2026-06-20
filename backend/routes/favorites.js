const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");
const { verifyUser } = require("../middleware/auth");

// GET /api/favorites - list logged-in user's favorites
router.get("/", verifyUser, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).populate("movieId");
    res.json(favorites.map(f => f.movieId).filter(Boolean));
  } catch (error) {
    console.error("Fetch favorites error:", error);
    res.status(500).json({ message: "Failed to fetch favorites list" });
  }
});

// POST /api/favorites/toggle - toggle favorite movie state
router.post("/toggle", verifyUser, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    const existing = await Favorite.findOne({ userId: req.user._id, movieId });
    
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      res.json({ message: "Movie removed from favorites", favorited: false });
    } else {
      const newFav = new Favorite({ userId: req.user._id, movieId });
      await newFav.save();
      res.json({ message: "Movie added to favorites", favorited: true });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Failed to toggle favorite state" });
  }
});

module.exports = router;
