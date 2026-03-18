const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const checkBlockedUser = require("../utils/checkBlockStatus");

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
    }).select("_id isAdmin isBlocked blockedUntil");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    const blockStatus = await checkBlockedUser(user);

    if (blockStatus.blocked) {
      return res.status(blockStatus.status).json({
        success: false,
        message: blockStatus.message,
      });
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
