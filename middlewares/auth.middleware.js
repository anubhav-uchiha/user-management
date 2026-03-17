const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authenticateUser = async (req, res, next) => {
  try {
    const requestHeaders = req.headers.authorization;
    if (!requestHeaders || !requestHeaders?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }
    const token = requestHeaders?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded._id,
      is_deleted: false,
    }).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    if (user.isBlocked) {
      if (user.blockedUntil && user.blockedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          message: `User is blocked unitl ${user.blockedUntil}`,
        });
      }

      if (!user.blockedUntil) {
        return res.status(403).json({
          success: false,
          message: "User is permanently blocked",
        });
      }

      if (user.blockedUntil <= new Date()) {
        user.isBlocked = false;
        user.blockedUntil = null;
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
