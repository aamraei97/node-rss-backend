const express = require("express");
const { sourceRoutes } = require("../modules/v1/sources/source.routes");
const { feedRoutes } = require("../modules/v1/feed/feed.routes");
const { tagRoutes } = require("../modules/v1/tags/tag.routes");
const { userRoutes } = require("../modules/v1/users/user.routes");

const router = express.Router();

router.use("/api/v1/panel/sources", sourceRoutes);
router.use("/api/v1/panel/feed", feedRoutes);
router.use("/api/v1/panel/tags", tagRoutes);
router.use("/api/v1/users", userRoutes);

module.exports = { router };
