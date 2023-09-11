const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories.controller");

router.get("/get-categories", categoryController.getCategories);

module.exports = router;
