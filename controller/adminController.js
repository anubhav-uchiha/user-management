const mongoose = require("mongoose");
const User = require("../models/userModel");

const getAllUser = async (req, res, next) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const pageNo = Math.max(parseInt(page_no) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(page_size) || 10, 1), 100);
    const skip = (pageNo - 1) * pageSize;

    const user = await User.find({ is_deleted: false, isAdmin: false })
      .select("-password")
      .skip(skip)
      .limit(pageSize)
      .lean()
      .sort({ createdAt: 1 });

    const totalUsers = await User.countDocuments({
      is_deleted: false,
      isAdmin: false,
    });

    return res.status(200).json({
      success: true,
      message: "All User details: ",
      page_no: pageNo,
      page_size: pageSize,
      total_users: totalUsers,
      total_pages: Math.ceil(totalUsers / pageSize),
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }
    const user = await User.findOne({
      _id: user_id,
      is_deleted: false,
      isAdmin: false,
    })
      .select("-password")
      .lean();

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    return res
      .status(200)
      .json({ success: true, message: "User detail: ", data: user });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const { days, reason } = req.body;
    const parsedDays = parseInt(days);

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid user" });
    }

    if (req.user._id.toString() === user_id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const user = await User.findById(user_id);

    if (!user || user.is_deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res
        .status(403)
        .json({ success: false, message: "Admin user cannot be blocked" });
    }

    if (user.isBlocked) {
      return res.status(400).json({
        success: false,
        message: "User is already blocked",
      });
    }

    user.isBlocked = true;
    user.blockReason = reason || "No reason provided";
    user.updatedAt = new Date();

    if (parsedDays && parsedDays > 0) {
      user.blockedUntil = new Date(
        Date.now() + parsedDays * 24 * 60 * 60 * 1000,
      );
    } else {
      user.blockedUntil = null;
    }

    user.refreshToken = null;
    user.refreshTokenExpirey = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.blockedUntil
        ? `User blocked for ${parsedDays} days`
        : "User permanently blocked",
    });
  } catch (error) {
    next(error);
  }
};

const deleteUserById = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOneAndDelete({
      _id: user_id,
      isAdmin: false,
    });

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    return res
      .status(200)
      .json({ success: true, message: "User Deleted Successfully!" });
  } catch (error) {
    next(error);
  }
};

const deleteAllUser = async (req, res, next) => {
  try {
    const user = await User.deleteMany({ isAdmin: false });

    if (user.deletedCount === 0) {
      const error = new Error("No users found");
      error.status = 404;
      return next(error);
    }
    return res
      .status(200)
      .json({ success: true, message: "All User Deleted!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUser,
  getUserById,
  blockUser,
  deleteUserById,
  deleteAllUser,
};
