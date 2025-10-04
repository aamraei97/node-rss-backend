const { Feed } = require("./feed.model");
const mongoose = require("mongoose");
const Parser = require("rss-parser");
const parser = new Parser();
const { extractFeed } = require("../../../utils/extract-feed");
const { redisClient } = require("../../../lib/redis");
const { Source } = require("../sources/source.model");

const populateFeed = async ({ sourceId }) => {
  const theSource = await Source.findById(sourceId);

  let items = [];
  if (theSource.hrefSelector) {
    items = await extractFeed({
      url: theSource.link,
      hrefSelector: theSource.hrefSelector,
      titleSelector: theSource.titleSelector,
      timeSelector: theSource.timeSelector,
    });
  } else {
    const parseResults = await parser.parseURL(theSource.link);
    console.log("RAQ XML RESULT: ", parseResults.items[0]);
    items = parseResults.items.map((item) => ({
      ...item,
      publishedAt: item.pubDate || new Date(),
    }));
  }

  // validate result
  let isNotValid = false;

  items.map((item, index) => {
    if (!item.link || !item.title || !item.publishedAt) {
      console.log(`Wrong item: ${index}`);
      console.log(items[index]);
      isNotValid = true;
    }
  });
  if (isNotValid) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Shape of the extracted data is not correct" });
  }

  let temp = items.map((i) => ({
    title: i.title,
    link: i.link,
    publishedAt: new Date(i.publishedAt),
    source: sourceId,
  }));
  console.log("FINAL RESULT LENGTH: ", temp.length);
  console.log("FINAL RESULT SAMPLE: ", temp);

  const operations = temp.map((item) => ({
    updateOne: {
      filter: {
        link: item.link,
      },
      update: { $setOnInsert: item },
      upsert: true,
    },
  }));

  await Feed.bulkWrite(operations);
  await Source.findByIdAndUpdate(sourceId, { lastCrawl: new Date() });

  // delete cache
  const theRedis = await redisClient;
  await theRedis.del("sources");

  return true;
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
