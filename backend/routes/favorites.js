const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyUser } = require("../middleware/auth");

// GET /api/favorites - list logged-in user's favorites
router.get("/", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favorites");
    res.json(user?.favorites || []);
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

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const index = user.favorites.findIndex(favId => favId.toString() === movieId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: "Movie removed from favorites", favorited: false });
    } else {
      user.favorites.push(movieId);
      await user.save();
      res.json({ message: "Movie added to favorites", favorited: true });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Failed to toggle favorite state" });
  }
});

module.exports = router;
