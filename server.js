const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");
const userRouter = require("./router/userRouter");
const PORT = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.send("API is Running...");
});

app.use("/api/users", userRouter);
app.listen(PORT, () => {
  console.log(`server is runnung on http://localhost:${PORT}`);
});
