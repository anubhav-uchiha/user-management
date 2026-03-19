require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./router/userRouter");
const authRouter = require("./router/authRouter");
const adminRouter = require("./router/adminRouter");
const errorHandler = require("./middlewares/error.middleware");
const startUnblockCron = require("./cron/unblockUsers.cron");
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

connectDB();
startUnblockCron();

app.get("/", (req, res) => {
  res.send("API is Running...");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
