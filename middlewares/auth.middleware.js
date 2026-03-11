const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  try {
    const requestHears = req.headers.authorization;
    if (!requestHears || !requestHears?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }
    const token = requestHears?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. Token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = authenticateUser;
