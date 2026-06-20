const User = require("../models/User");

const verifyUser = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || req.headers["authorization"];
    if (!userId) {
      return res.status(401).json({ message: "Access denied. No authentication session." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User session is invalid." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error during authentication." });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyUser(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  });
};

module.exports = { verifyUser, verifyAdmin };
