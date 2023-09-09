var express = require("express");
var router = express.Router();
const siteController = require("../controller/api/site.api.controller");
const authMidleWare = require("../middleWare/auth.middlewere");
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.post("/login", siteController.login);
router.post("/register", siteController.register);
router.get("/logout", authMidleWare.apiAuth, siteController.logout);
router.get("/profile", authMidleWare.apiAuth, siteController.detailProfile);
router.get("/verify/:id/:token", siteController.verifyEmail);
module.exports = router;
