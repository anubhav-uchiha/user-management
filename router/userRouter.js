const express = require("express");
const {
  getMyProfile,
  changePassword,
  uploadProfileImage,
  updateUser,
  softDeleteUser,
  logoutUser,
} = require("../controller/userController");
const authenticateUser = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { changePasswordSchema } = require("../validations/user.validation");
const upload = require("../utils/multer");

const router = express.Router();

router.get("/getProfile", authenticateUser, getMyProfile);
router.patch(
  "/changePassword",
  authenticateUser,
  validate(changePasswordSchema),
  changePassword,
);
router.patch(
  "/uploadProfileImage",
  authenticateUser,
  upload.single("profileImgae"),
  uploadProfileImage,
);
router.put("/updateUser", authenticateUser, updateUser);
router.delete("/softDeleteUser/:id", authenticateUser, softDeleteUser);
router.post("/lougout", authenticateUser, logoutUser);

module.exports = router;
