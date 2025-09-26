const { StatusCodes } = require("http-status-codes");
const {
  populateFeed,
  getFeedEntries,
  increaseReadCountByOne,
  notInterestedToFeed,
} = require("./feed.service");
const { Source } = require("../sources/source.model");
const { Feed } = require("./feed.model");
const Parser = require("rss-parser");
const parser = new Parser();
const { extractFeed } = require("../../../utils/extract-feed");
const { redisClient } = require("../../../lib/redis");

const populate = async (req, res) => {
  try {
    const { sourceId } = req.params;

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

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Feed populated", result: theSource });
  } catch (err) {
    console.log({ err });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }
};

const getFeed = async (req, res) => {
  const { sourceId, title, after, sourceCredibility } = req.query;
  const results = await getFeedEntries({
    sourceId,
    title,
    after,
    sourceCredibility,
  });

  return res.status(StatusCodes.OK).json({ results });
};

const increaseReadCount = async (req, res) => {
  const { feedId } = req.params;

  const result = await increaseReadCountByOne({ feedId });

  return res.status(StatusCodes.OK).json({ result });
};

const notInterested = async (req, res) => {
  const { feedId } = req.params;

  const result = await notInterestedToFeed({ feedId });

  return res.status(StatusCodes.OK).json({ result });
};

module.exports = { populate, getFeed, increaseReadCount, notInterested };
