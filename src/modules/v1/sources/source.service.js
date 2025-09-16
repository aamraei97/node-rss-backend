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
    { $sort: { credibilityRank: -1, lastCrawl: -1 } }, // descending: very-high → low
    { $project: { credibilityRank: 0 } },
  ]);

  return result;
};

module.exports = { createSource, getAllSources };
