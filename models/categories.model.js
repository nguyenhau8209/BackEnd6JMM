const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  total: {
    type: Number,
    default: 0,
  },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
