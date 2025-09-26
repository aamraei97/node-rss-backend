const mongoose = require("mongoose");

const feedSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      unique: true,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Source",
      required: true,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    notInterested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Feed = mongoose.model("Feed", feedSchema);

module.exports = { Feed };
