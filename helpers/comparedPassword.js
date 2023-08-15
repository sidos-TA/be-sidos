const bcrypt = require("bcrypt");
const bcryptRegex = require("../constants/bcryptRegex");

const comparedPassword = async (passwordPlain, hashPassword) => {
  let isPasswordValid;
  if (bcryptRegex?.test(hashPassword)) {
    isPasswordValid = await bcrypt?.compare(passwordPlain, hashPassword);
  } else {
    isPasswordValid = passwordPlain === hashPassword;
  }
  return isPasswordValid;
};
module.exports = comparedPassword;
