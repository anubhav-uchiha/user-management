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

module.exports = { getAllUser, getUserById, deleteUserById, deleteAllUser };
