const jwt = require("jsonwebtoken");

const decodeJWT = ({ req }) => {
  const token = req?.headers?.authorization?.split(" ")?.[1];
  const decode = jwt?.decode(token);

  return decode;
};

module.exports = decodeJWT;
