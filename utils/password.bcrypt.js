const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};
const comparePassword = async (plainPassword, hashedPassword) => {
  const compared = await bcrypt.compare(plainPassword, hashedPassword);
  return compared;
};

module.exports = { hashPassword, comparePassword };
