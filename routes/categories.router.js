const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories.controller");
const middleWare = require("../middleWare/auth.middlewere.js");

router.get(
  "/get-categories",
  middleWare.apiAuth,
  categoryController.getCategories
);

module.exports = router;
