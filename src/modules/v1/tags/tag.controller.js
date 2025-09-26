const { StatusCodes } = require("http-status-codes");
const { createTag, getAllTags } = require("./tag.service");
const { Tag } = require("./tag.model");
const create = async (req, res) => {
  const { name } = req.body;

  const createdTag = await createTag({
    name,
  });

  return res
    .status(StatusCodes.CREATED)
    .json({ success: true, message: "Tag created", result: createdTag });
};

const getAll = async (req, res) => {
  const result = await getAllTags();

  return res.status(StatusCodes.OK).json({ success: true, result });
};
module.exports = { create, getAll };
