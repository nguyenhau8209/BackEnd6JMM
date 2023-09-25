const Total = require("../models/total.model");
const returnRes = require("../utils/config");
const acountModel = require("../models/acount.model");
exports.getTotals = async (req, res) => {
  const userID = req.query.userID;
  console.log(userID);
  if (!userID) {
    return returnRes(res, 404, "Invalid userID");
  }
  try {
    const findUserID = await acountModel.acount.findById(req.query.userID);
    if (!findUserID) {
      return returnRes(res, 404, "userID not found");
    }
    const totals = await Total.find({ userID });
    if (!totals) {
      return returnRes(res, 404, "totals not found");
    }
    return returnRes(res, 200, totals, "get totals success");
  } catch (error) {
    return returnRes(res, 500, error.message);
  }
};
