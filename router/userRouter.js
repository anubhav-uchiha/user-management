const express = require("express");
const {
  getMyProfile,
  changePassword,
  updateUser,
  softDeleteUser,
} = require("../controller/userController");
const authenticateUser = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { changePasswordSchema } = require("../validations/user.validation");

const router = express.Router();

router.get("/getProfile", authenticateUser, getMyProfile);
router.put(
  "/changePassword",
  authenticateUser,
  validate(changePasswordSchema),
  changePassword,
);
router.put("/updateUser", authenticateUser, updateUser);
router.delete("/softDeleteUser/:id", authenticateUser, softDeleteUser);

module.exports = router;
