const { Source } = require("./source.model");
const { redisClient } = require("../../../lib/redis");

const createSource = async ({
  name,
  link,
  favicon,
  hrefSelector,
  titleSelector,
  timeSelector,
  sourceCredibility,
  tags,
}) => {
  const result = await Source.create({
    name,
    link,
    favicon,
    hrefSelector,
    titleSelector,
    timeSelector,
    sourceCredibility,
    tags,
  });

  // delete cache
  const theRedis = await redisClient;
  await theRedis.del("sources");

  return result;
};

const getAllSources = async () => {
  // get from cache
  const theRedis = await redisClient;
  const cachedSources = await theRedis.get("sources");

  if (cachedSources) {
    console.log("from cache. ttl", await theRedis.ttl("sources"));
    return { result: JSON.parse(cachedSources), fromCache: true };
  }

  const result = await Source.aggregate([
    {
      $lookup: {
        from: "feeds",
        let: { sourceId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$source", "$$sourceId"] },
                  // notInterested is false OR doesn't exist
                  {
                    $or: [
                      { $eq: ["$notInterested", false] },
                      { $not: [{ $ifNull: ["$notInterested", false] }] },
                    ],
                  },
                  {
                    $or: [
                      { $eq: ["$readCount", 0] },
                      { $not: [{ $ifNull: ["$readCount", 0] }] },
                    ],
                  },
                  {
                    $gt: [
                      { $toDate: "$publishedAt" },
                      new Date("2019-09-01T00:00:00Z"),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "feeds",
      },
    },
    // Count feeds
    {
      $addFields: {
        feedCount: { $size: "$feeds" },
      },
    },
    { $sort: { credibilityRank: -1, lastCrawl: -1 } }, // descending: very-high → low
    { $project: { credibilityRank: 0, feeds: 0 } },
  ]);

  // cache the result
  await theRedis.set("sources", JSON.stringify(result), {
    // expiration: 60 * 60 * 24, // 24 hours
    expiration: {
      type: "EX",
      value: 60 * 60 * 1, // 1 hours
    },
  });

  return { result, fromCache: false };
};

module.exports = { createSource, getAllSources };
