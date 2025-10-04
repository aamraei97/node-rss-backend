const { StatusCodes } = require("http-status-codes");
const {
  populateFeed,
  getFeedEntries,
  increaseReadCountByOne,
  notInterestedToFeed,
} = require("./feed.service");

const populate = async (req, res) => {
  try {
    const { sourceId } = req.params;

    await populateFeed({ sourceId });

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Feed populated", result: { success: true } });
  } catch (err) {
    console.log({ err });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }
};

const getFeed = async (req, res) => {
  const { sourceId, title, after, sourceCredibility, showReadHistory } =
    req.query;
  const results = await getFeedEntries({
    sourceId,
    title,
    after,
    sourceCredibility,
    showReadHistory,
  });

  return res.status(StatusCodes.OK).json({
    data: results.data,
    totalCount: results.totalCount,
  });
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

module.exports = {
  populate,
  getFeed,
  increaseReadCount,
  notInterested,
};
