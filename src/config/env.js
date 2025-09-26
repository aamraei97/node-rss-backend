const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

// 1. Determine the environment
const env = process.env.NODE_ENV;

// 2. Load the proper .env file
const envFile = path.resolve(process.cwd(), `.env.${env}`);

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`Env file ${envFile} not found, falling back to default .env`);
  dotenv.config();
}

const envKeys = {
  MONGO_URL: process.env.MONGO_URL,
  PORT: process.env.PORT,
  RESEND_KEY: process.env.RESEND_KEY,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
};

module.exports = { envKeys };
