const { Tag } = require("./tag.model");

const createTag = async ({
  name,
}) => {
  const existingTag = await Tag.findOne({ name });
  if (existingTag) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Tag already exists" });
  }

  const result = await Tag.create({
    name,
  });

  return result;
};

const getAllTags = async () => {
  const result = await Tag.find();

  return result;
};

module.exports = { createTag, getAllTags };
