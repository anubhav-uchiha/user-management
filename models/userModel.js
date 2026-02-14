const mongoose = require("mongoose");

const geoSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      require: true,
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
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },
    zipcode: {
      type: String,
      required: true,
    },
    geo: {
      type: geoSchema,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: true,
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

const User = mongoose.model("User", userSchema);
module.exports = User;
