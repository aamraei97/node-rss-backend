const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const { resendClient } = require("../../../lib/resend");

const { User } = require("./user.model");
const {
  RegistrationSession,
} = require("../registration-session/registration-session.model");
const { StatusCodes } = require("http-status-codes");

const enterEmail = async ({ email }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser?.password) {
    return {
      step: "password",
    };
  }
  // get latest session for email
  const session = await RegistrationSession.findOne({ email }).sort({
    createdAt: -1,
  });
  const sessionOtpHasTime = session && new Date() < new Date(session.expiresAt);
  if (existingUser && !existingUser?.password && sessionOtpHasTime) {
    return {
      step: "otp",
      expiresAt: new Date(session.expiresAt).toISOString(),
    };
  } else {
    let now = new Date();
    // Add 3 minutes
    now.setMinutes(now.getMinutes() + 3);
    // send otp to provided email
    let otp = crypto.randomInt(100_000, 1_000_000);
    console.log({ otp });
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await RegistrationSession.create({
      email,
      otp: hashedOtp,
      expiresAt: now,
    });
    await resendClient.emails.send({
      from: "feed@armanamraei.ir",
      to: [email],
      subject: "کد احراز هویت",
      html: `کد احراز هویت شما: ${otp}`,
    });

    return {
      step: "otp",
      expiresAt: now.toISOString(),
    };
  }
};
const verifyEmail = async ({ email, otp }) => {
  // get latest session for email
  const session = await RegistrationSession.findOne({ email }).sort({
    createdAt: -1,
  });
  if (!session) return { success: false, message: "otp session not found" };

  const valid = await bcrypt.compare(otp, session.otp);
  if (!valid) return res.status(400).json({ message: "Invalid OTP" });

  session.verified = true;
  await session.save();

  return {
    success: true,
    message: "OTP verified, proceed to set password",
    step: "set-password",
  };
};
const setPassword = async ({ email, otp, password }) => {
  // get latest verified session for email
  const session = await RegistrationSession.findOne({
    email,
    verified: true,
  }).sort({ createdAt: -1 });
  if (!session) {
    return {
      success: false,
      message: "OTP not verified or session expired",
      statusCode: StatusCodes.BAD_REQUEST,
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // create user
  const user = await User.create({ email, password: passwordHash });

  // clean up session
  await RegistrationSession.deleteMany({ email });

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, "test");

  return { success: true, token, user, statusCode: StatusCodes.CREATED };
};
module.exports = { enterEmail, verifyEmail, setPassword };
