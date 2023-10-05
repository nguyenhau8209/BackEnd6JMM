const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories.controller");
const authMidleWare = require("../middleWare/auth.middlewere");

router.get(
  "/categories",
  authMidleWare.apiAuth,
  categoryController.getCategories
);

router.get(
  "/categories2",
  authMidleWare.apiAuth,
  categoryController.getCategoriesByUserID
);

router.get(
  "/filterbydate",
  authMidleWare.apiAuth,
  categoryController.getTotalByFillter
);
module.exports = router;
