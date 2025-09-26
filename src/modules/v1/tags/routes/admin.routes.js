const express = require("express");
const { create, getAll } = require("../tag.controller");
const adminTagRoutes = express.Router();

adminTagRoutes.post("/", create);
adminTagRoutes.get("/", getAll);

module.exports = { adminTagRoutes };
