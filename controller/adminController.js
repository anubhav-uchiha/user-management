const mongoose = require("mongoose");
const User = require("../models/userModel");
const { isBlock } = require("typescript");

const getAllUser = async (req, res, next) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const pageNo = Math.max(parseInt(page_no) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(page_size) || 10, 1), 100);
    const skip = (pageNo - 1) * pageSize;

    const [users, totalUsers] = await Promise.all([
      User.find({ is_deleted: false, isAdmin: false })
        .select("-password -refreshToken -refreshTokenExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),

      User.countDocuments({
        is_deleted: false,
        isAdmin: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "All User details: ",
      page_no: pageNo,
      page_size: pageSize,
      total_users: totalUsers,
      total_pages: Math.ceil(totalUsers / pageSize),
      data: users,
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
      .select("-password -refreshToken -refreshTokenExpiry")
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

const searchUser = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      name,
      city,
      isBlocked,
      page_no = 1,
      page_size = 10,
    } = req.query;
    const pageNo = Math.max(parseInt(page_no) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(page_size) || 10, 1), 100);
    const skip = (pageNo - 1) * pageSize;

    const filter = { isAdmin: false };
    if (email) {
      filter.email = { $regex: email?.trim(), $options: "i" };
    }
    if (phone) {
      filter.phone = { $regex: phone?.trim(), $options: "i" };
    }
    if (name) {
      filter.$or = [
        { first_name: { $regex: name?.trim(), $options: "i" } },
        { last_name: { $regex: name?.trim(), $options: "i" } },
      ];
    }
    if (city) {
      filter["address.city"] = { $regex: city?.trim(), $options: "i" };
    }
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === "true";
    }
    const [user, total] = await Promise.all([
      (
        await User.find(filter)
          .select("-password -refreshTpken -refreshTokenExpiry")
          .skip(skip)
          .limit(pageSize)
      )
        .toSorted({ createdAt: -1 })
        .lean(),
      User.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      page_no: pageNo,
      page_size: pageSize,
      total,
      total_pages: Math.ceil(total / pageSize),
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;
    const { days, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user");
      error.status = 400;
      return next(error);
    }

    if (req.user._id.toString() === user_id) {
      const error = new Error("You cannot block yourself");
      error.status = 400;
      return next(error);
    }

    const user = await User.findById(user_id);

    if (!user || user.is_deleted) {
      const error = new Error("User not found");
      error.status = 400;
      return next(error);
    }

    if (user.isAdmin) {
      const error = new Error("Admin user cannot be blocked");
      error.status = 400;
      return next(error);
    }

    if (user.isBlocked) {
      const error = new Error("User is already blocked");
      error.status = 400;
      return next(error);
    }

    let blockedUntil = null;

    if (days !== undefined) {
      if (!Number.isInteger(Number(days)) || Number(days) <= 0) {
        const error = new Error("Days must be a valid integer");
        error.status = 400;
        return next(error);
      }

      const parsedDays = Number(days);

      blockedUntil = new Date(Date.now() + parsedDays * 24 * 60 * 60 * 1000);
    }

    user.isBlocked = true;
    user.blockedUntil = blockedUntil;
    user.blockReason = reason || "No reason provided";
    user.updatedAt = new Date();

    user.refreshToken = null;
    user.refreshTokenExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: blockedUntil
        ? `User blocked for ${days} days`
        : "User permanently blocked",
    });
  } catch (error) {
    next(error);
  }
};
const unblockUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOneAndUpdate(
      { _id: user_id, isAdmin: false },
      {
        isBlocked: false,
        blockedUntil: null,
        blockReason: "",
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!user || user.is_deleted) {
      const error = new Error("User not found");
      error.status = 400;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: blockedUntil
        ? `User blocked for ${days} days`
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
  searchUser,
  blockUser,
  unblockUser,
  deleteUserById,
  deleteAllUser,
};
