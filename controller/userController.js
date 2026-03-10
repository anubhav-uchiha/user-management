const mongoose = require("mongoose");
const User = require("../models/userModel");

const createUser = async (req, res) => {
  try {
    const { name, email, phone, company, address } = req.body;

    if (!name || !email || !phone || !company || !address) {
      return res
        .status(400)
        .json({ success: false, message: "All Field Required" });
    }

    if (!address.city || !address.zipcode || !address.geo) {
      return res.status(400).json({ message: "Address Field Requied" });
    }

    if (
      typeof address.geo.lat !== "number" ||
      typeof address.geo.lng !== "number"
    ) {
      return res.status(400).json({ message: "Geo Coordinate must be number" });
    }

    if (
      address.geo.lat < -90 ||
      address.geo.lat > 90 ||
      address.geo.lng < -180 ||
      address.geo.lng > 180
    ) {
      return res
        .status(400)
        .json({ message: "Invalid latitude or longitude value" });
    }

    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(409).json({ message: "User Already Exists" });
    }
    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      company: company.trim(),
      address: {
        city: address.city.trim(),
        zipcode: address.zipcode.trim(),
        geo: { lat: address.geo.lat, lng: address.geo.lng },
      },
    });

    const saveUser = await newUser.save();
    return res
      .status(201)
      .json({ message: "User Created Successfully!", saveUser });
  } catch (error) {
    console.error("create User error: ", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page_no = 1, page_size = 10 } = req.query;
    const pageNo = parseInt(page_no);
    const pageSize = parseInt(page_size);
    const skip = (pageNo - 1) * pageSize;

    const user = await User.find().skip(skip).limit(pageSize);

    const totalUsers = await User.countDocuments();

    if (user.length === 0) {
      return res.status(404).json({ error: "User not Found!" });
    }
    return res.status(200).json({
      message: "All User details: ",
      pageNo,
      pageSize,
      totalUsers,
      user,
    });
  } catch (error) {
    console.error("get All User error: ", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "No User Found" });
    }

    return res.status(200).json({ message: "User detail: ", user });
  } catch (error) {
    console.error("get All User error: ", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const { email } = req.body;

    if (req.body.address?.geo) {
      const { lat, lng } = req.body.address.geo;

      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({
          message: "Geo coordinates must be numbers",
        });
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
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
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ message: "Invalid User Id" });
    }

    const user = await User.findByIdAndDelete(user_id);

    if (!user) {
      return res.status(404).json({ messsage: "No User Found" });
    }
    return res.status(200).json({ message: "User Deleted Successfully!" });
  } catch (error) {
    console.error("get All User error: ", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

const deleteAllUser = async (req, res) => {
  try {
    const user = await User.deleteMany({});

    if (user.deletedCount === 0) {
      return res.status(404).json({ message: "No User Found" });
    }
    return res.status(200).json({ message: "All User Deleted!" });
  } catch (error) {
    console.error("Delete All User error: ", error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUserById,
  deleteAllUser,
};
