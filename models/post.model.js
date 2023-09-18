const db = require("./connectDatabase");

const postSchema = db.mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    content: {
      type: String,
      require: true,
    },
    userID: {
      type: db.mongoose.Schema.ObjectId,
      ref: "acount",
      required: true,
    },
  },
  { timestamps: true }
);
let post = db.mongoose.model("post", postSchema);
module.exports = { post };
