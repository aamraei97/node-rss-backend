const { StatusCodes } = require("http-status-codes");
const UserService = require("./user.service");

const authEnterEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await UserService.enterEmail({
      email,
    });

    return res
      .status(StatusCodes.OK)
      .json({ message: "Otp Send to Your Email", result });
  } catch (error) {
    console.log({ error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }
};

const authVerifyOtp = async (req, res) => {
  const { otp, email } = req.body;

  try {
    const result = await UserService.verifyEmail({
      email,
      otp,
    });
    console.log({ result });
    if (result.success) {
      return res
        .status(StatusCodes.OK)
        .json({ message: "Otp Verified", result: { step: result.step } });
    }
  } catch (error) {
    console.log({ error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }
};

const authSetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "password and confirm password are not equal" });
  }

  const result = await UserService.setPassword({ email, otp, password });
  if (result.success) {
    return res
      .status(result.statusCode)
      .json({
        message: "User Created",
        token: result.token,
        user: result.user,
      });
  }
};
module.exports = { authEnterEmail, authVerifyOtp, authSetPassword };
