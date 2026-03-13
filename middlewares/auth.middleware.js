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

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
