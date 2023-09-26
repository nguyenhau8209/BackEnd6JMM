const mongoose = require("mongoose");

const totalSchema = new mongoose.Schema({
  userID: String,
  code: String,
  total: Number,
});

const Total = mongoose.model("Total", totalSchema);

module.exports = Total;
