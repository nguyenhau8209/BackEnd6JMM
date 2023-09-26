const express = require("express");
const routers = express.Router();
const tokengoogle = require("../controller/token_gg.controller");

routers.post("/generate-new-token", tokengoogle.generateToken);
module.exports = routers;
