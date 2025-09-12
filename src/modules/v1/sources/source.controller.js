const { StatusCodes } = require("http-status-codes");
const { createSource, getAllSources } = require("./source.service");
const { getFavicon } = require("../../../utils/get-favicon");

const create = async (req, res) => {
  const {
    name,
    link,
    hrefSelector,
    titleSelector,
    sourceCredibility,
    timeSelector,
  } = req.body;
  try {
    const favicon = await getFavicon(link);

    const createdSource = await createSource({
      name,
      link,
      hrefSelector,
      titleSelector,
      favicon,
      sourceCredibility,
      timeSelector,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Source created", result: createdSource });
  } catch (error) {
    console.log({ error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }

};

const getAll = async (req, res) => {
  const result = await getAllSources();

  return res.status(StatusCodes.OK).json({ result });
};
module.exports = { create, getAll };
