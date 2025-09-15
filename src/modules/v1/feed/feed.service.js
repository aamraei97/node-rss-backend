const { Feed } = require("./feed.model");
const populateFeed = async ({ name, link }) => {
  // const result = await Feed.create({ name, rssLink: link });
  return {};
};

const getFeedEntries = async ({ sourceId, title }) => {
  let query = {};
  if (sourceId) {
    query.source = sourceId;
  }
  if (title) {
    query.title = { $regex: title, $options: "i" };
  }
  const afterDate = new Date("2019-09-01T00:00:00Z");

  const result = await Feed.find({
    notInterested: { $ne: true },
    ...query,
    $or: [{ readCount: { $lt: 1 } }, { readCount: { $exists: false } }],
    $expr: { $gt: [{ $toDate: "$publishedAt" }, afterDate] },
  })
    .sort({ publishedAt: -1 })
    // .skip(600)
    .populate("source");

  return result;
};

const increaseReadCountByOne = async ({ feedId }) => {
  const feed = await Feed.findByIdAndUpdate(
    feedId,
    { $inc: { readCount: 1 } },
    { new: true }
  );

  if (!feed) {
  }

  return feed;
};
const notInterestedToFeed = async ({ feedId }) => {
  const feed = await Feed.findByIdAndUpdate(
    feedId,
    { notInterested: true },
    { new: true }
  );

  if (!feed) {
  }

  return feed;
};
module.exports = {
  populateFeed,
  getFeedEntries,
  increaseReadCountByOne,
  notInterestedToFeed,
};
