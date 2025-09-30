const express = require("express");
const {
  authEnterEmail,
  authVerifyOtp,
  authSetPassword,
  authLogin,
} = require("./user.controller");
const userRoutes = express.Router();

userRoutes.post("/auth/enter-email", authEnterEmail);
userRoutes.post("/auth/verify-otp", authVerifyOtp);
userRoutes.post("/auth/set-password", authSetPassword);
userRoutes.post("/auth/login", authLogin);

module.exports = { userRoutes };
