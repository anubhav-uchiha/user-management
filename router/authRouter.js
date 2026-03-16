const express = require("express");
const validate = require("../middlewares/validation.middleware");
const {
  createUserSchema,
  loginSchema,
} = require("../validations/user.validation");
const {
  createUser,
  loginUser,
  refreshAccessToken,
} = require("../controller/authController");
const router = express.Router();

router.post("/createUser", validate(createUserSchema), createUser);
router.post("/loginUser", validate(loginSchema), loginUser);
router.post("/refreshAccessToken", refreshAccessToken);

module.exports = router;
