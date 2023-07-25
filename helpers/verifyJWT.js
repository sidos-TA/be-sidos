const jwt = require("jsonwebtoken");
const unAuthResponse = require("./unAuthResponse");

const verifyJWT = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];

  jwt?.verify(token, process.env.JWT_SECRET_KEYS, (err, decode) => {
    if (err) {
      unAuthResponse({ res });
    } else {
      next();
    }
  });
};

module.exports = verifyJWT;
