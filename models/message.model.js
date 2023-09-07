const db = require("./connectDatabase");

const messageSchema = db.mongoose.Schema(
  {
    message: { type: String, require: true },
    userID: {
      type: db.mongoose.Schema.ObjectId,
      ref: "acount",
      required: true,
    },
    language: { type: String, require: false },
    code: { type: String, require: false },
    price: { type: String, require: false },
  },
  {
    timestamps: true,
  }
);

let message = db.mongoose.model("message", messageSchema);
module.exports = {
  message,
};
