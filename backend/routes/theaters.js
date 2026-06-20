const express = require("express");
const router = express.Router();
const Theater = require("../models/Theater");
const { verifyAdmin } = require("../middleware/auth");

// GET /api/theaters - list all theaters
router.get("/", async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ createdAt: -1 });
    res.json(theaters);
  } catch (error) {
    console.error("Fetch theaters error:", error);
    res.status(500).json({ message: "Failed to fetch theaters" });
  }
});

// GET /api/theaters/:id - get single theater details
router.get("/:id", async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json(theater);
  } catch (error) {
    console.error("Fetch theater error:", error);
    res.status(500).json({ message: "Failed to fetch theater details" });
  }
});

// POST /api/theaters - create theater (Admin only)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { name, location, rateRange, imageUrl, rows, colsCount, verticalAisles, horizontalAisles } = req.body;

    if (!name || !location || !rateRange) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const newTheater = new Theater({
      name,
      location,
      rateRange,
      imageUrl,
      rows,
      colsCount,
      verticalAisles,
      horizontalAisles
    });

    await newTheater.save();
    res.status(201).json({ message: "Theater created successfully", theater: newTheater });
  } catch (error) {
    console.error("Create theater error:", error);
    res.status(500).json({ message: "Failed to create theater" });
  }
});

// PUT /api/theaters/:id - update theater (Admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const updatedTheater = await Theater.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTheater) {
      return res.status(404).json({ message: "Theater not found" });
    }

    res.json({ message: "Theater updated successfully", theater: updatedTheater });
  } catch (error) {
    console.error("Update theater error:", error);
    res.status(500).json({ message: "Failed to update theater" });
  }
});

// DELETE /api/theaters/:id - delete theater (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const deletedTheater = await Theater.findByIdAndDelete(req.params.id);
    if (!deletedTheater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json({ message: "Theater deleted successfully" });
  } catch (error) {
    console.error("Delete theater error:", error);
    res.status(500).json({ message: "Failed to delete theater" });
  }
});

module.exports = router;
