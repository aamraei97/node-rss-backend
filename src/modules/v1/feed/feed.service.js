const { Feed } = require("./feed.model");
const mongoose = require("mongoose");
const populateFeed = async ({ name, link }) => {
  // const result = await Feed.create({ name, rssLink: link });
  return {};
};

const getFeedEntries = async ({
  sourceId,
  title,
  after,
  sourceCredibility,
  showReadHistory,
}) => {
  // let afterDate = new Date("2019-09-01T00:00:00Z");
  // if (after && new Date(after) > afterDate) {
  //   afterDate = new Date(after);
  // }
  let allQueries = [];
  let matchQueries = {};
  if (sourceId) {
    matchQueries.source = new mongoose.Types.ObjectId(sourceId);
  }
  if (title) {
    matchQueries.title = { $regex: title, $options: "i" };
  }
  if (showReadHistory) {
    matchQueries["readCount"] = { $gt: 0 };
  } else {
    matchQueries["$or"] = [
      { readCount: { $lt: 1 } },
      { readCount: { $exists: false } },
    ];
  }

  allQueries.push({
    $match: {
      notInterested: { $ne: true },
      ...matchQueries,
      // $expr: { $gt: [{ $toDate: "$publishedAt" }, afterDate] },
    },
  });
  allQueries.push({
    $lookup: {
      from: "sources", // collection name of Source model
      localField: "source",
      foreignField: "_id",
      as: "source",
    },
  });
  allQueries.push({ $unwind: "$source" }); // turn array into object);
  // allQueries.push({ $skip: 1000 }); // turn array into object);
  if (sourceCredibility) {
    allQueries.push({
      $match: {
        "source.sourceCredibility": "very-high",
      },
    });
  }

  if (showReadHistory) {
    allQueries.push({ $sort: { lastReadAt: -1 } });
  } else {
    allQueries.push({ $sort: { publishedAt: -1 } });
  }

  // ✅ Facet: data + totalCount
  const result = await Feed.aggregate([
    ...allQueries,
    {
      $facet: {
        data: [{ $skip: 0 }, { $limit: 50000 }],
        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  return {
    data: result[0].data,
    totalCount: result[0].totalCount[0].count,
  };
};

const increaseReadCountByOne = async ({ feedId }) => {
  const feed = await Feed.findByIdAndUpdate(
    feedId,
    { $inc: { readCount: 1 }, lastReadAt: new Date() },
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
