const bcrypt = require("bcrypt");

const comparedPassword = async (passwordPlain, hashPassword) => {
  const isPasswordValid = await bcrypt?.compare(passwordPlain, hashPassword);
  return isPasswordValid;
};
module.exports = comparedPassword;
