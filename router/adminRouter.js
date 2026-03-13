const express = require("express");

const authenticateUser = require("../middlewares/auth.middleware");
const authorizedAdmin = require("../middlewares/admin.middleware");

const {
  getAllUser,
  getUserById,
  deleteUserById,
  deleteAllUser,
} = require("../controller/adminController");

const router = express.Router();

router.get("/getAllUser", authenticateUser, authorizedAdmin, getAllUser);
router.get("/getUserById/:id", authenticateUser, authorizedAdmin, getUserById);
router.delete(
  "/deleteUserById/:id",
  authenticateUser,
  authorizedAdmin,
  deleteUserById,
);
router.delete(
  "/deleteAllUser",
  authenticateUser,
  authorizedAdmin,
  deleteAllUser,
);

module.exports = router;
