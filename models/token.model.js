const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "acount",
    require: true,
  },
  token: {
    type: String,
    require: true,
  },
});

const Token = mongoose.model("token", tokenSchema);
module.exports = Token;
