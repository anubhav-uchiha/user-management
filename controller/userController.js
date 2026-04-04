const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password.bcrypt.js");

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req?.user?._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid user Id");
      error.status = 400;
      return next(error);
    }
    const user = await User.findOne({ _id: userId, is_deleted: false })
      .select("-password")
      .lean();
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user_id = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }

    const { first_name, last_name, email, phone, address } = req.body;

    const emailTrim = email?.trim()?.toLowerCase();
    const phoneTrim = phone?.trim();
    const firstNameTrim = first_name?.trim();
    const lastNameTrim = last_name?.trim();

    // Prevent restricted updates
    if ("password" in req.body) {
      const error = new Error("Password cannot be updated here");
      error.status = 400;
      return next(error);
    }

    if ("isAdmin" in req.body) {
      const error = new Error("isAdmin cannot be updated here");
      error.status = 400;
      return next(error);
    }

    if ("is_deleted" in req.body) {
      const error = new Error("is_deleted cannot be updated here");
      error.status = 400;
      return next(error);
    }

    // Email duplicate check
    if (emailTrim && !validator.isEmail(emailTrim)) {
      const error = new Error("Invalid email");
      error.status = 400;
      return next(error);
    }

    if (emailTrim) {
      const duplicateEmail = await User.findOne({
        email: emailTrim,
        is_deleted: false,
        _id: { $ne: user_id },
      });

      if (duplicateEmail) {
        const error = new Error("Email already exists");
        error.status = 409;
        return next(error);
      }
    }

    // Phone duplicate check
    if (phoneTrim && !validator.isMobilePhone(phoneTrim, "any")) {
      const error = new Error("Invalid phone number");
      error.status = 400;
      return next(error);
    }

    if (phoneTrim) {
      const duplicatePhone = await User.findOne({
        phone: phoneTrim,
        is_deleted: false,
        _id: { $ne: user_id },
      });

      if (duplicatePhone) {
        const error = new Error("Phone already exists");
        error.status = 409;
        return next(error);
      }
    }

    // Allowed fields
    const updateData = {};

    if (firstNameTrim !== undefined) {
      if (!firstNameTrim) {
        const error = new Error("First name cannot be empty");
        error.status = 400;
        return next(error);
      }
      updateData.first_name = firstNameTrim;
    }

    if (lastNameTrim !== undefined) {
      if (!lastNameTrim) {
        const error = new Error("Last name cannot be empty");
        error.status = 400;
        return next(error);
      }
      updateData.last_name = lastNameTrim;
    }

    if (emailTrim !== undefined) {
      if (!emailTrim) {
        const error = new Error("Email cannot be empty");
        error.status = 400;
        return next(error);
      }
      updateData.email = emailTrim;
    }

    if (phoneTrim !== undefined) {
      if (!phoneTrim) {
        const error = new Error("Phone cannot be empty");
        error.status = 400;
        return next(error);
      }
      updateData.phone = phoneTrim?.trim();
    }

    if (address !== undefined) {
      if (
        typeof address !== "object" ||
        address === null ||
        Array.isArray(address)
      ) {
        const error = new Error("address must be an object");
        error.status = 400;
        return next(error);
      }
      if (address.city !== undefined) {
        updateData["address.city"] = address.city?.trim()?.toLowerCase();
      }
      if (address.state !== undefined) {
        updateData["address.state"] = address.state?.trim()?.toLowerCase();
      }
      if (address.country !== undefined) {
        updateData["address.country"] = address.country?.trim()?.toLowerCase();
      }
      if (address.zipcode !== undefined) {
        updateData["address.zipcode"] = address.zipcode?.trim();
      }

      if (address.geo !== undefined) {
        const { lat, lng } = address.geo || {};

        if (lat === undefined || lng === undefined) {
          const error = new Error("Geo coordinates are required");
          error.status = 400;
          return next(error);
        }

        if (typeof lat !== "number" || typeof lng !== "number") {
          const error = new Error("Geo coordinates must be numbers");
          error.status = 400;
          return next(error);
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          const error = new Error("Invalid latitude or longitude");
          error.status = 400;
          return next(error);
        }

        updateData["address.geo"] = { lat, lng };
      }
    }

    if (Object.keys(updateData).length === 0) {
      const error = new Error("No valid fields provided for update");
      error.status = 400;
      return next(error);
    }

    updateData.updatedAt = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { _id: user_id, is_deleted: false },
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password -refreshToken -refreshTokenExpiry");

    if (!updatedUser) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error = new Error("Invalid User Id");
      error.status = 400;
      return next(error);
    }
    let { oldPassword, newPassword, confirmPassword } = req.body;
    oldPassword = oldPassword?.trim();
    newPassword = newPassword?.trim();
    confirmPassword = confirmPassword?.trim();

    if (!oldPassword || !newPassword || !confirmPassword) {
      const error = new Error("All fields are required");
      error.status = 400;
      return next(error);
    }
    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minUppercase: 1,
        minSymbols: 1,
      })
    ) {
      const error = new Error(
        "Password must be at least 8 characters and include upper case character, lower case character, number and symbol",
      );
      error.status = 400;
      return next(error);
    }

    if (newPassword !== confirmPassword) {
      const error = new Error(
        "New Password did not match with confirm password",
      );
      error.status = 400;
      return next(error);
    }
    const user = await User.findOne({
      _id: userId,
      is_deleted: false,
    }).select("+password");
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }
    const isMatch = await comparePassword(oldPassword, user.password);

    if (!isMatch) {
      const error = new Error("Old password is incorrect");
      error.status = 400;
      return next(error);
    }
    const isSamePassword = await comparePassword(newPassword, user.password);

    if (isSamePassword) {
      const error = new Error(
        "New password must be different from the current password",
      );
      error.status = 400;
      return next(error);
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.refreshToken = null;
    user.refreshTokenExpiry = null;
    user.updatedAt = new Date();
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    if (!file) {
      const error = new Error("Image file is required");
      error.status = 400;
      return next(error);
    }
    if (!userId) {
      const error = new Error("Invalid User");
      error.status = 400;
      return next(error);
    }
    const imagePath = file.path;
    const user = await User.findOneAndUpdate(
      { _id: userId, is_deleted: false },
      { profileImage: imagePath, updatedAt: new Date() },
      { new: true },
    ).select("-password -refreshToken -refreshTokenExpiry");

    if (!user) {
      const error = new Error("No user Found");
      error.status = 400;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "Profile image upload successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {};

const softDeleteUser = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }

    if (req.user._id.toString() !== user_id && !req.user.isAdmin) {
      const error = new Error("Unauthorized to delete this account");
      error.status = 403;
      return next(error);
    }

    const user = await User.findOneAndUpdate(
      {
        _id: user_id,
        is_deleted: false,
        isAdmin: false,
      },
      {
        is_deleted: true,
        refreshToken: null,
        refreshTokenExpiry: null,
        updatedAt: new Date(),
      },
      { new: true },
    );

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      success: true,
      message: "User soft deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      refreshTokenExpiry: null,
      updatedAt: new Date(),
    });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateUser,
  changePassword,
  uploadProfileImage,
  softDeleteUser,
  logoutUser,
};
