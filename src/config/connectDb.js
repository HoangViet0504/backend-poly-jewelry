const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
  host: process.env.HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "poly_jewelry",
  port: process.env.PORT || 3306,
});

db.getConnection()
    .then(connection => {
        console.log("Đã kết nối tới database");
        connection.release();
    })
    .catch(err => {
        console.error("Lỗi kết nối tới database:", err);
        throw err;
    });

module.exports = db;