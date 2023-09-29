const db = require("./connectDatabase");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SIGN_PRIVATE = process.env.SIGN_PRIVATE;
const bcrypt = require("bcrypt");

const acountSchema = new db.mongoose.Schema(
  {
    fullname: { type: String, require: false },
    email: { type: String, require: true },
    password: { type: String, require: true },
    verified: { type: Boolean, default: false, require: true },
  },
  {
    timestamps: true,
  }
);

//create token login
acountSchema.methods.generateAuthToken = async function () {
  const user = this;
  console.log(user);
  const token = jwt.sign({ _id: user._id, email: user.email }, SIGN_PRIVATE, {
    expiresIn: "1y",
  });
  user.token = token;
  await user.save();
  return token;
};

//find user by id
//use for login
acountSchema.statics.findByCredentials = async (email, password) => {
  const user = await acount.findOne({ email: email });

  if (!user) {
    return { error: true, messahe: "Email not found" };
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return { error: true, message: "Password is not incorrect" };
  }

  return user;
};

let acount = db.mongoose.model("acount", acountSchema);
module.exports = {
  acount,
};
