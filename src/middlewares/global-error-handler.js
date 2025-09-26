const { StatusCodes } = require("http-status-codes");

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";
  const details = err.details || null;

  return res.status(statusCode).json({ success: false, message, details });
};

module.exports = { globalErrorHandler };
