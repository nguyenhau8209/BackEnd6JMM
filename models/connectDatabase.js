const mongoose = require("mongoose");
require("dotenv").config();

const local_url = process.env.MONGODB_LOCAL_URL;
const network_url = process.env.MONGODB_NETWORK_URL;
mongoose
  .connect(network_url)
  .then(() => console.log("Connected successfully!"))
  .catch((err) => console.log("connected false: ", err));

module.exports = {
  mongoose,
};
