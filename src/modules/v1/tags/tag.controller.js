const { StatusCodes } = require("http-status-codes");
const { createTag, getAllTags } = require("./tag.service");
const { Tag } = require("./tag.model");
const create = async (req, res) => {
  const {
    name,
  } = req.body;

  try {


    const createdTag = await createTag({
      name,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Tag created", result: createdTag });
  } catch (error) {
    console.log({ error });
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed" });
  }

};

const getAll = async (req, res) => {
  const result = await getAllTags();

  return res.status(StatusCodes.OK).json({ result });
};
module.exports = { create, getAll };
