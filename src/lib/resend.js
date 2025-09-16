const { Resend } = require("resend");
const { envKeys } = require("../config/env");
const resendClient = new Resend(envKeys.RESEND_KEY);

module.exports = { resendClient };
