const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password.bcrypt.js");
const genrateToken = require("../utils/genrate.token.js");

const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, address } = req.body;

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !phone.trim() ||
      !address
    ) {
      const error = new Error("All Field Are Required");
      error.status = 400;
      return next(error);
    }

    if (
      !address.city?.trim() ||
      !address.state?.trim() ||
      !address.country?.trim() ||
      !address.zipcode?.trim() ||
      !address.geo
    ) {
      const error = new Error("Address fields are required");
      error.status = 400;
      return next(error);
    }

    if (
      typeof address.geo.lat !== "number" ||
      typeof address.geo.lng !== "number"
    ) {
      const error = new Error("Geo coordinates must be numbers");
      error.status = 400;
      return next(error);
    }

    if (
      address.geo.lat < -90 ||
      address.geo.lat > 90 ||
      address.geo.lng < -180 ||
      address.geo.lng > 180
    ) {
      const error = new Error("Invalid latitude or longitude value");
      error.status = 400;
      return next(error);
    }

    const firt_nameTrim = first_name.trim();
    const last_nameTrim = last_name.trim();
    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();
    const phoneTrim = phone.trim();
    const cityTrim = address.city.trim().toLowerCase();
    const stateTrim = address.state.trim().toLowerCase();
    const countryTrim = address.country.trim().toLowerCase();
    const zipcodeTrim = address.zipcode.trim();
    const lat = address.geo.lat;
    const lng = address.geo.lng;

    if (!validator.isEmail(emailTrim)) {
      const error = new Error("Invalid email");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOne({
      $or: [{ email: emailTrim }, { phone: phoneTrim }],
      is_deleted: false,
    });

    if (user) {
      const error = new Error("Email or phone already exists");
      error.status = 409;
      return next(error);
    }
    if (
      !validator.isStrongPassword(passwordTrim, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      const error = new Error(
        "Password must contain uppercase, lowercase, number and symbol",
      );
      error.status = 400;
      return next(error);
    }
    const passwordHashed = await hashPassword(passwordTrim);

    const newUser = new User({
      first_name: firt_nameTrim,
      last_name: last_nameTrim,
      email: emailTrim,
      password: passwordHashed,
      phone: phoneTrim,
      address: {
        city: cityTrim,
        state: stateTrim,
        country: countryTrim,
        zipcode: zipcodeTrim,
        geo: { lat: lat, lng: lng },
      },
    });

    const saveUser = await newUser.save();
    return res
      .status(201)
      .json({ success: true, message: "User Created Successfully!", saveUser });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) {
      const error = new Error("Email and password required");
      error.status = 400;
      return next(error);
    }
    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    if (!validator.isEmail(emailTrim)) {
      const error = new Error("Invalid email");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOne({
      email: emailTrim,
      is_deleted: false,
    }).select("+password");

    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    const passwordCompare = await comparePassword(passwordTrim, user.password);

    if (!passwordCompare) {
      const error = new Error("Invalid password");
      error.status = 400;
      return next(error);
    }
    const token = await genrateToken({ _id: user._id });

    return res.status(200).json({
      success: true,
      message: "User Login SuccessFully!",
      data: user,
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const skip = (pageNo - 1) * pageSize;

    const user = await User.find({ is_deleted: false, isAdmin: false })
      .skip(skip)
      .limit(pageSize);

    const totalUsers = await User.countDocuments({ is_deleted: false });

    if (user.length === 0) {
      const error = new Error("User not Found!");
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({
      success: true,
      message: "All User details: ",
      page_no: pageNo,
      page_size: pageSize,
      total_users: totalUsers,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }
    const user = await User.findOne({ _id: user_id, is_deleted: false });

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

const updateUser = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }

    const { email, phone } = req.body;

    const emailTrim = email.trim().toLowerCase();
    const phoneTrim = phone.trim();

    if (req.body.address?.geo) {
      const { lat, lng } = req.body.address.geo;

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

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

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

const deleteUserById = async (req, res, next) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      const error = new Error("Invalid user id");
      error.status = 400;
      return next(error);
    }

    const user = await User.findByIdAndDelete(user_id);

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
    const user = await User.deleteMany({});

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
  createUser,
  loginUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUserById,
  deleteAllUser,
};
