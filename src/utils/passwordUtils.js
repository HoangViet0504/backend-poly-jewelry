const bcrypt = require("bcrypt");
const saltRounds = 10;

// Hàm hash mật khẩu
const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// Hàm kiểm tra mật khẩu
const comparePassword = async (inputPassword, storedHashedPassword) => {
  return await bcrypt.compare(inputPassword, storedHashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};
