const express = require("express");
const router = express.Router();
const totalsController = require("../controller/total.controller");
const authMidleWare = require("../middleWare/auth.middlewere");
router.get("/totals", authMidleWare.apiAuth, totalsController.getTotals);

module.exports = router;
