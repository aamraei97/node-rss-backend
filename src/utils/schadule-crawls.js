const cron = require("node-cron");
const { Source } = require("../modules/v1/sources/source.model");
const { populateFeed } = require("../modules/v1/feed/feed.service");

const runningJobs = new Map();

async function crawlSource(source) {
  console.log(
    `[CRAWL] Starting job for Source ID: ${source._id} with period: ${source.crawlPeriod}`
  );

  try {
    // get the last crawl time
    const lastCrawlTime = new Date(source.lastCrawl);

    // check if the last crawl time is less than the crawl period
    if (
      lastCrawlTime >
      new Date(Date.now() - source.crawlPeriod * 24 * 60 * 60 * 1000)
    ) {
      console.log(
        `[CRAWL] Skipping job for Source ID: ${source._id} because it was last crawled less than ${source.crawlPeriod} days ago`
      );
      return;
    }
    await populateFeed({ sourceId: source._id.toString() });
    console.log(`[CRAWL] Completed job for Source ID: ${source._id}`);
  } catch (error) {
    console.error(
      `[CRAWL] Error starting job for Source ID: ${source._id}`,
      error
    );
  }
}

async function startAllJobs() {
  try {
    const sources = await Source.find({
      crawlPeriod: { $ne: null, $exists: true },
    });

    console.log(`[CRAWL] Found ${sources.length} sources to crawl`);

    for (const source of sources) {
      // check if job is already running
      if (runningJobs.has(source._id)) {
        runningJobs.get(source._id).stop();
        runningJobs.delete(source._id);
        console.log(
          `[CRAWL] Stopped running job for Source ID: ${source._id}-${source.name}`
        );
      }

      // create a valid cron job time schema based on crawl Period. 1 day, 2 day, 3day and etc.
      const cronTime = `0 ${parseInt(source.crawlPeriod) * 24} * * *`;

      if (cron.validate(cronTime)) {
        // create a new job
        const job = cron.schedule(
          cronTime,
          () => {
            crawlSource(source);
          },
          {
            scheduled: true,
            timezone: "Asia/Tehran",
          }
        );

        // add job to runningJobs map
        runningJobs.set(source._id.toString(), job);

        // start job
        job.start();
      } else {
        console.log(
          `[CRAWL] Invalid cron time for Source ID: ${source._id}-${source.name}`
        );
        continue;
      }

      console.log(
        `[CRAWL] Started job for Source ID: ${source._id}-${source.name}`
      );
    }
  } catch (error) {
    console.error(`[CRAWL] Error starting all crawls`, error);
  }
}

/**
 * Stops all running cron jobs. Useful for graceful shutdown.
 */
function stopAllJobs() {
  runningJobs.forEach((job) => job.stop());
  runningJobs.clear();
  console.log("[SCHEDULER] All cron jobs stopped.");
}

module.exports = {
  startAllJobs,
  stopAllJobs,
  crawlSource, // You might need this if you manually trigger a crawl
};
