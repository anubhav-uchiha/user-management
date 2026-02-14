const express = require("express");
const {
  createUser,
  getAllUser,
  getUserById,
  updateUser,
  deleteUserById,
  deleteAllUser,
} = require("../controller/userController");

const userRouter = express.Router();

userRouter.post("/createUser", createUser);
userRouter.get("/getAllUser", getAllUser);
userRouter.get("/getUserById/:user_id", getUserById);
userRouter.put("/updateUser/:user_id", updateUser);
userRouter.delete("/deleteUserById/:user_id", deleteUserById);
userRouter.delete("/deleteAllUser", deleteAllUser);

module.exports = userRouter;
