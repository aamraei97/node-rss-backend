const express = require("express");
const { create, getAll } = require("./tag.controller");
const tagRoutes = express.Router();

tagRoutes.post("/", create);
tagRoutes.get("/", getAll);

module.exports = { tagRoutes };
