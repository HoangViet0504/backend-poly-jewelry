const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// const db = mysql.createPool({
//   host: process.env.HOST || "localhost",
//   user: process.env.DB_USER || "root",
//   password: process.env.DB_PASSWORD || "",
//   database: process.env.DB_NAME || "poly_jewelry",
//   port: process.env.DB_PORT || 3306, // Sửa PORT thành DB_PORT
//   waitForConnections: true,
//   connectionLimit: 10, // Giới hạn số kết nối
//   queueLimit: 0,
// });

const db = mysql.createPool({
  host: process.env.HOST || "89.116.21.73",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "12345678@Ab!...",
  database: process.env.DB_NAME || "VIET_PRO_SQL",
  port: process.env.DB_PORT || 3306, // Sửa PORT thành DB_PORT
  waitForConnections: true,
  connectionLimit: 10, // Giới hạn số kết nối
  queueLimit: 0,
});

db.getConnection()
  .then((connection) => {
    console.log("✅ Đã kết nối database!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối database:", err);
    throw err;
  });

module.exports = db;
