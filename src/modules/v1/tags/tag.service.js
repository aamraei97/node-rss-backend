const { Tag } = require("./tag.model");
const { AppError } = require("../../../utils/app-error");
const { StatusCodes } = require("http-status-codes");

const createTag = async ({ name }) => {
  const existingTag = await Tag.findOne({ name });
  if (existingTag) {
    throw new AppError("Tag already exists", StatusCodes.BAD_REQUEST);
  }

  const createdTag = await Tag.create({
    name,
  });
  return createdTag;
};

const getAllTags = async () => {
  const result = await Tag.find();

  return result;
};

module.exports = { createTag, getAllTags };
