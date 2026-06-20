require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS configuration - allowing local and production frontend URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", // including port 3001 just in case
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Strip trailing slashes

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const cleanOrigin = origin.replace(/\/$/, "");
      const isAllowed = allowedOrigins.includes(cleanOrigin);
      
      if (!isAllowed) {
        console.log(`CORS Blocked for origin: ${origin}. Allowed origins:`, allowedOrigins);
        return callback(null, false); // Reject without throwing a 500 server crash
      }
      
      return callback(null, true);
    },
    credentials: true,
  })
);

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);

// Health Check / Test Route
app.get("/", (req, res) => {
  res.json({ message: "Movie Booking App Express Backend is running." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
