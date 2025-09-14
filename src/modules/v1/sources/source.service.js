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
      $addFields: {
        credibilityRank: {
          $switch: {
            branches: [
              { case: { $eq: ["$sourceCredibility", "very-high"] }, then: 4 },
              { case: { $eq: ["$sourceCredibility", "high"] }, then: 3 },
              { case: { $eq: ["$sourceCredibility", "medium"] }, then: 2 },
              { case: { $eq: ["$sourceCredibility", "low"] }, then: 1 },
            ],
            default: 0,
          },
        },
      },
    },
    { $sort: { credibilityRank: -1 } }, // descending: very-high → low
    { $project: { credibilityRank: 0 } },
  ]);

  return result;
};

module.exports = { createSource, getAllSources };
