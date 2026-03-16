const validator = require("validator");
const User = require("../models/userModel");
const {
  hashPassword,
  comparePassword,
} = require("../utils/password.bcrypt.js");
const genrateToken = require("../utils/genrate.token.js");
const generateRefreshToken = require("../utils/generate.refresh.token.js");
const hashToken = require("../utils/hash.token.js");

const createUser = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, phone, address } = req.body;

    if (
      !first_name?.trim() ||
      !last_name?.trim() ||
      !email?.trim() ||
      !password?.trim() ||
      !phone?.trim() ||
      !address
    ) {
      const error = new Error("All Field Are Required");
      error.status = 400;
      return next(error);
    }

    if (
      !address?.city?.trim() ||
      !address?.state?.trim() ||
      !address?.country?.trim() ||
      !address?.zipcode?.trim() ||
      !address?.geo
    ) {
      const error = new Error("Address fields are required");
      error.status = 400;
      return next(error);
    }

    if (
      typeof address?.geo?.lat !== "number" ||
      typeof address?.geo?.lng !== "number"
    ) {
      const error = new Error("Geo coordinates must be numbers");
      error.status = 400;
      return next(error);
    }

    if (
      address?.geo?.lat < -90 ||
      address?.geo?.lat > 90 ||
      address?.geo?.lng < -180 ||
      address?.geo?.lng > 180
    ) {
      const error = new Error("Invalid latitude or longitude value");
      error.status = 400;
      return next(error);
    }

    const first_nameTrim = first_name?.trim();
    const last_nameTrim = last_name?.trim();
    const emailTrim = email?.trim()?.toLowerCase();
    const passwordTrim = password?.trim();
    const phoneTrim = phone?.trim();
    const cityTrim = address?.city?.trim()?.toLowerCase();
    const stateTrim = address?.state?.trim()?.toLowerCase();
    const countryTrim = address?.country?.trim()?.toLowerCase();
    const zipcodeTrim = address?.zipcode?.trim();
    const lat = address?.geo?.lat;
    const lng = address?.geo?.lng;

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
      first_name: first_nameTrim,
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
    saveUser.password = undefined;
    return res.status(201).json({
      success: true,
      message: "User Created Successfully!",
      data: saveUser,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      const error = new Error("Email and password required");
      error.status = 400;
      return next(error);
    }
    const emailTrim = email?.trim()?.toLowerCase();
    const passwordTrim = password?.trim();

    if (!validator.isEmail(emailTrim)) {
      const error = new Error("Invalid email");
      error.status = 400;
      return next(error);
    }

    const user = await User.findOne({
      email: emailTrim,
      is_deleted: false,
    }).select("+password");

    if (!user || !(await comparePassword(passwordTrim, user.password))) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      return next(error);
    }

    const accessToken = genrateToken({ _id: user._id, isAdmin: user.isAdmin });

    const refreshToken = generateRefreshToken({ _id: user._id });

    const hashedRefreshToken = hashToken(refreshToken);

    user.refreshToken = hashedRefreshToken;
    user.refreshTokenExpirey = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await user.save();

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User Login SuccessFully!",
      data: user,
      token: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const hashedToken = hashToken(refreshToken);

    const user = await user
      .findOne({
        _id: decoded._id,
        refreshToken: hashToken,
        is_deleted: false,
      })
      .select("+refreshToken");
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid refresh " });
    }

    const newAccessToken = genrateToken({
      _id: user._id,
      isAdmin: user.isAdmin,
    });
    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, loginUser, refreshAccessToken };
