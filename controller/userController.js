const mongoose = require("mongoose");
const validator = require("validator");
const User = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password.bcrypt.js");
const genrateToken = require("../utils/genrate.token.js");
const createUser = async (req, res) => {
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
      return res
        .status(400)
        .json({ success: false, message: "All Field Required" });
    }

    if (
      !address.city?.trim() ||
      !address.state?.trim() ||
      !address.country?.trim() ||
      !address.zipcode?.trim() ||
      !address.geo
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Address Field Requied" });
    }

    if (
      typeof address.geo.lat !== "number" ||
      typeof address.geo.lng !== "number"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Geo Coordinate must be number" });
    }

    if (
      address.geo.lat < -90 ||
      address.geo.lat > 90 ||
      address.geo.lng < -180 ||
      address.geo.lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude value",
      });
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
      return res.status(400).json({ success: false, message: "Email invalid" });
    }

    const user = await User.findOne({ email: emailTrim, is_deleted: false });

    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User Already Exists" });
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
      return res.status(400).json({
        success: false,
        message:
          "password must have 8 character length and contain lowecase character, uppercase character, number, symbols",
      });
    }
    const passwordHashed = await hashPassword(passwordTrim);
    if (!passwordHashed) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }
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
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email.trim() || !password.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "All Field Required" });
    }
    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    if (!validator.isEmail(emailTrim)) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    const user = await User.findOne({
      email: emailTrim,
      is_deleted: false,
    }).select("+password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "No user found!" });
    }

    const passwordCompare = await comparePassword(passwordTrim, user.password);

    if (!passwordCompare) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password" });
    }
    const token = await genrateToken({ _id: user._id });
    // const userData = {
    //   _id: user._id,
    //   first_name: user.first_name,
    //   last_name: user.last_name,
    //   email: user.email,
    //   phone: user.phone,
    //   address: {
    //     city: user.address.city,
    //     state: user.address.state,
    //     country: user.address.country,
    //     zipcode: user.address.zipcode,
    //     geo: {
    //       lat: address.geo.lat,
    //       lng: address.geo.lng,
    //     },
    //   },
    // };
    return res.status(200).json({
      success: true,
      message: "User Login SuccessFully!",
      data: user,
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const skip = (pageNo - 1) * pageSize;

    const user = await User.find({ is_deleted: false, isAdmin: false })
      .skip(skip)
      .limit(pageSize);

    const totalUsers = await User.countDocuments();

    if (user.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not Found!" });
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
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }
    const user = await User.findOne({ _id: user_id, is_deleted: false });

    if (!user) {
      return res.status(404).json({ success: false, message: "No User Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User detail: ", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID" });
    }

    const { email } = req.body;

    if (req.body.address?.geo) {
      const { lat, lng } = req.body.address.geo;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return res
          .status(400)
          .json({ success: false, message: "Geo coordinates must be numbers" });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude or longitude value",
        });
      }
    }

    if (email) {
      const duplicateEmail = await User.findOne({
        email: email,
        _id: { $ne: user_id },
      });

      if (duplicateEmail) {
        return res
          .status(409)
          .json({ success: false, message: "Email already exists" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User Id" });
    }

    const user = await User.findByIdAndDelete(user_id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, messsage: "No User Found" });
    }
    return res
      .status(200)
      .json({ success: false, message: "User Deleted Successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

const deleteAllUser = async (req, res) => {
  try {
    const user = await User.deleteMany({});

    if (user.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "No User Found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "All User Deleted!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
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
