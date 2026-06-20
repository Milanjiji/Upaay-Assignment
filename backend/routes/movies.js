const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const { verifyAdmin } = require("../middleware/auth");

// GET /api/movies - list all movies, optional filter by showingType
router.get("/", async (req, res) => {
  try {
    const { showingType } = req.query;
    const query = {};
    if (showingType) {
      query.showingType = showingType;
    }
    
    const movies = await Movie.find(query).sort({ releaseDate: -1 });
    res.json(movies);
  } catch (error) {
    console.error("Fetch movies error:", error);
    res.status(500).json({ message: "Failed to fetch movies" });
  }
});

// GET /api/movies/:id - get single movie details
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error("Fetch movie error:", error);
    res.status(500).json({ message: "Failed to fetch movie details" });
  }
});

// POST /api/movies - create movie (Admin only)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { title, genre, rating, pgRating, description, formats, releaseDate, showingType, posterUrl, cast } = req.body;

    if (!title || !genre || !formats || !releaseDate || !showingType) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newMovie = new Movie({
      title,
      genre,
      rating,
      pgRating,
      description,
      formats,
      releaseDate,
      showingType,
      posterUrl,
      cast
    });

    await newMovie.save();
    res.status(201).json({ message: "Movie created successfully", movie: newMovie });
  } catch (error) {
    console.error("Create movie error:", error);
    res.status(500).json({ message: "Failed to create movie" });
  }
});

// PUT /api/movies/:id - update movie (Admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie updated successfully", movie: updatedMovie });
  } catch (error) {
    console.error("Update movie error:", error);
    res.status(500).json({ message: "Failed to update movie" });
  }
});

// DELETE /api/movies/:id - delete movie (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Delete movie error:", error);
    res.status(500).json({ message: "Failed to delete movie" });
  }
});

module.exports = router;
