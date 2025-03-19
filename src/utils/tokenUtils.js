const jwt = require("jsonwebtoken");
const secretKey = "FPTISNUMBERONE";

// Hàm tạo Access Token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "30s" });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, secretKey, { expiresIn: "7d" });
};

// Hàm xác minh token
const verifyToken = (token) => {
  return jwt.verify(token, secretKey);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
