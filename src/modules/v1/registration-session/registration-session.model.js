const mongoose = require("mongoose");

const registrationSessionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

registrationSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 10 }
);
const RegistrationSession = mongoose.model(
  "RegistrationSession",
  registrationSessionSchema
);

module.exports = { RegistrationSession };
