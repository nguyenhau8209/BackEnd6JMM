const acountModal = require("../models/acount.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SIGN_PRIVATE = process.env.SIGN_PRIVATE;

const apiAuth = async (req, res, next) => {
  let header_token = req.header("Authorization");

  if (typeof header_token == "undefined") {
    res.status(403).json({ status: 403, message: "unknown token" });
  }
  const token = header_token.replace("Bearer ", "");
  console.log(token);
  try {
    const data = jwt.verify(token, SIGN_PRIVATE);
    console.log(data?._id);
    const user = await acountModal.acount.findOne({
      _id: data._id,
      token: token,
    });
    console.log(user);
    if (!user) {
      throw new Error("unknown user");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: 401, message: error.message });
  }
};

module.exports = {
  apiAuth,
};
