const mongoose = require("mongoose");
const { envKeys } = require("./env");

async function connectDb() {
  console.log({ envKeys });
  try {
    return await mongoose.connect(envKeys.MONGO_URL);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDb;
