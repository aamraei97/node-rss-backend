const express = require("express");
const { create, getAll } = require("./source.controller");
const sourceRoutes = express.Router();

sourceRoutes.post("/", create);
sourceRoutes.get("/", getAll);

module.exports = { sourceRoutes };
