const mongoose = require("mongoose");

const geoSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    zipcode: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
    },
    geo: {
      type: geoSchema,
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    index: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
    minlength: 10,
    maxlength: 13,
  },
  address: {
    type: addressSchema,
    required: true,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

userSchema.index({ email: 1, is_deleted: 1 });
userSchema.index({ phone: 1, is_deleted: 1 });
userSchema.index({ is_deleted: 1, isAdmin: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
