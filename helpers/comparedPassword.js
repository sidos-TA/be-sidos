const bcrypt = require("bcrypt");

const comparedPassword = async (passwordPlain, hashPassword) => {
  const bcryptRegex = /^\$2[ayb]\$.{56}$/;
  let isPasswordValid;
  if (bcryptRegex?.test(hashPassword)) {
    isPasswordValid = await bcrypt?.compare(passwordPlain, hashPassword);
  } else {
    isPasswordValid = passwordPlain === hashPassword;
  }
  return isPasswordValid;
};
module.exports = comparedPassword;
