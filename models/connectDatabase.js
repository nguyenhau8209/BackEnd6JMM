const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://vinhdev31:congvinh2003@cluster0.rmuqlpf.mongodb.net/6JMM"
  )
  .then(() => console.log("Connected successfully!"))
  .catch((err) => console.log("connected false: ", err));

module.exports = {
  mongoose,
};
