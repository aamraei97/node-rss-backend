const mongoose = require("mongoose");

const sourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
    },
    hrefSelector: {
      type: String,
    },
    titleSelector: {
      type: String,
    },
    timeSelector: {
      type: String,
    },
    favicon: {
      type: String,
    },
    lastCrawl: {
      type: Date,
    },
    sourceCredibility: {
      type: String,
      enum: ["low", "medium", "high", "very-high"],
      default: "medium",
    },
    credibilityRank: { type: Number, default: 0 }, // derived field
    tags: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.every((tag) => tag instanceof mongoose.Types.ObjectId);
        },
        message: "All tags must be valid ObjectId.",
      },
    },
  },
  { timestamps: true }
);
sourceSchema.pre("save", function (next) {
  const map = {
    "very-high": 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  this.credibilityRank = map[this.sourceCredibility] || 0;

  next();
});
const Source = mongoose.model("Source", sourceSchema);

module.exports = { Source };
