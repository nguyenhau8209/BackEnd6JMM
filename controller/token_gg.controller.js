const jwt = require("jsonwebtoken");
const {
  OAuth2Client,
} = require("google-auth-library/build/src/auth/oauth2client");
require("dotenv").config();

async function verifyGoogleIdToken(token) {
  const client = new OAuth2Client();
  try {
    console.log("aaaaa");
    console.log(token);
    console.log(process.env.CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      requiredAudience: process.env.CLIENT_ID,
    });
    console.log("vvvvvv");
    const payload = ticket.getPayload();
    console.log(payload);
    return payload;
  } catch (error) {
    console.error("Error verifying Google ID token:", error);
    return null;
  }
}
exports.generateToken = (req, res) => {
  const { id_token } = req.body;
  console.log(req.body);
  console.log(id_token);
  verifyGoogleIdToken(id_token)
    .then((googleTokenInfo) => {
      if (googleTokenInfo) {
        const { sub, email, email_verified, createdAt } = googleTokenInfo;
        const newTokenPayload = {
          sub: googleTokenInfo.sub,
          email: googleTokenInfo.email,
          custom_data: "Your_custom_data_here",
        };
        const newToken = jwt.sign(newTokenPayload, process.env.SIGN_PRIVATE, {
          expiresIn: "24h",
        });
        res
          .status(200)
          .json({
            status: 200,
            data: {
              id: sub,
              email: email,
              token: newToken,
              verified: email_verified,
              createdAt: createdAt,
            },
          });
      } else {
        res
          .status(400)
          .json({ status: 400, message: "Invalid Google ID token" });
      }
    })
    .catch((error) => {
      console.error("Error verifying Google ID token:", error);
      res.status(500).json({ status: 500, message: "Internal server error" });
    });
};
