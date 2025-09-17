const { Source } = require("./source.model");

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
  return result;
};

const getAllSources = async () => {
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
    { $project: { credibilityRank: 0 } },
  ]);

  return result;
};

module.exports = { createSource, getAllSources };
