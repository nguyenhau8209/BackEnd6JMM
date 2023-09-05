const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/6JMM")
  .then(() => console.log("Connected successfully!"))
  .catch((err) => console.log("connected false: ", err));

module.exports = {
  mongoose,
};
