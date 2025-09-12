const express = require("express");
const {
  populate,
  getFeed,
  increaseReadCount,
  notInterested,
} = require("./feed.controller");
const feedRoutes = express.Router();

feedRoutes.post("/:sourceId/populate", populate);
feedRoutes.get("/", getFeed);
feedRoutes.patch("/:feedId/increase-read-count", increaseReadCount);
feedRoutes.patch("/:feedId/not-interested", notInterested);

module.exports = { feedRoutes };
