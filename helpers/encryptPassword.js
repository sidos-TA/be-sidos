const bcrypt = require("bcrypt");

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSaltSync(10, "a");
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

module.exports = encryptPassword;
