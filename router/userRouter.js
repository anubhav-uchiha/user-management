const express = require("express");
const {
  createUser,
  loginUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUserById,
  deleteAllUser,
} = require("../controller/userController");
const authenticateUser = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const {
  createUserSchema,
  loginSchema,
} = require("../validations/user.validation");
const userRouter = express.Router();

userRouter.post("/createUser", validate(createUserSchema), createUser);
userRouter.post("/loginUser", validate(loginSchema), loginUser);
userRouter.get("/getAllUser", authenticateUser, getAllUser);
userRouter.get("/getUserById/:user_id", authenticateUser, getUserById);
userRouter.put("/updateUser/:user_id", authenticateUser, updateUser);
userRouter.delete("/deleteUserById/:user_id", authenticateUser, deleteUserById);
userRouter.delete("/deleteAllUser", authenticateUser, deleteAllUser);

module.exports = userRouter;
