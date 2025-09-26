const { createClient } = require("redis");
const { envKeys } = require("../config/env");

async function getRedisInstance() {
  return await createClient({
    username: envKeys.REDIS_USERNAME,
    password: envKeys.REDIS_PASSWORD,
    socket: {
      host: envKeys.REDIS_HOST,
      port: envKeys.REDIS_PORT,
    },
  })
    .on("error", (err) => console.log("Redis Client Error", err))
    .connect();
}
module.exports = { redisClient: getRedisInstance() };
