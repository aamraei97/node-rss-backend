const express = require("express");
const cors = require("cors");
const { router } = require("./router");
const connectDb = require("./config/db");
const { envKeys } = require("./config/env");
const { globalErrorHandler } = require("./middlewares/global-error-handler");
const jobScheduler = require("./utils/schadule-crawls");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// const router = express.Router();

// router.use("/", async (req, res, next) => {
//   try {
//     const feed = await parser.parseURL("https://kettanaito.com/blog/rss.xml");
//     console.log(feed);

//     // feed.items.forEach((item) => {
//     //   console.log(item.title + " : " + item.link);
//     // });
//   } catch (err) {
//     console.error("Error reading RSS:", err);
//   }
// });

app.use(router);
app.use(globalErrorHandler);

// Database Connection
connectDb().then(() => {
  console.log("Connected to MongoDB");
  // 1. Start all jobs once the DB connection is ready
  jobScheduler.startAllJobs();

  app.listen(envKeys.PORT, () => {
    console.log("Server is running on port 3020");
  });
});
// Graceful Shutdown: Stop jobs when the server closes
process.on("SIGINT", () => {
  jobScheduler.stopAllJobs();
  app.close(() => {
    console.log("Express server closed. Exiting.");
    process.exit(0);
  });
});
