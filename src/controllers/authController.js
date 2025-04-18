const db = require("../config/connectDb");
const bcrypt = require("bcrypt");
require("dotenv").config(); // Load biến môi trường từ .env
const jwt = require("jsonwebtoken");
const { generateAccessToken, verifyToken } = require("../utils/tokenUtils");

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
    const [existingUser] = await db.query(
      "SELECT id_user FROM user WHERE email = ? OR phone = ?",
      [email, phone]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email hoặc số điện thoại đã tồn tại",
      });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user vào database
    const [result] = await db.query(
      `INSERT INTO user (first_name, last_name, email, phone, password)
      VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, hashedPassword]
    );

    // Lấy ID user mới tạo
    const userId = result.insertId;

    // Tạo JWT token
    const token = jwt.sign(
      { id: userId, email, role: 2 },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    await db.query("UPDATE user SET access_token = ? WHERE id_user = ?", [
      token,
      userId,
    ]);
    res.json({
      message: "Đăng ký thành công",
      // user: { id: userId, first_name, last_name, email, phone },
      // token,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [userRows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }
    const user = userRows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }
    res.json({
      message: "Đăng nhập thành công",
      data: {
        access_token: user.access_token,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

// exports.me = async (req, res) => {
//   try {
//     // Lấy token từ header Authorization (Bearer token)
//     const token =
//       req.headers.authorization && req.headers.authorization.split(" ")[1];

//     // Nếu không có token, trả về lỗi
//     if (!token) {
//       return res.status(401).json({ message: "Token không hợp lệ" });
//     }

//     // Giải mã token và kiểm tra tính hợp lệ
//     const decoded = jwt.verify(token, process.env.SECRET_KEY); // SECRET_KEY được lưu trong biến môi trường

//     // Lấy ID người dùng từ decoded token
//     const { id } = decoded;

//     // Truy vấn thông tin người dùng từ database
//     const [userRows] = await db.query(
//       "SELECT * FROM user INNER JOIN address ON user.id_user = address.id_user WHERE user.id_user = ?",
//       [id]
//     );
//     console.log(userRows);

//     // Kiểm tra nếu không tìm thấy người dùng
//     if (userRows.length === 0) {
//       return res.status(404).json({ message: "Người dùng không tồn tại" });
//     }

//     const user = userRows[0]; // Lấy thông tin người dùng

//     // Trả về thông tin người dùng
//     res.json({
//       message: "Lấy thông tin thành công",
//       data: { user },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi lấy thông tin người dùng",
//       error: error.message,
//     });
//   }
// };

exports.me = async (req, res) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];

    // Nếu không có token, trả về lỗi
    if (!token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Giải mã token và kiểm tra tính hợp lệ
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // SECRET_KEY được lưu trong biến môi trường

    // Lấy ID người dùng từ decoded token
    const { id } = decoded;

    // Truy vấn thông tin người dùng và địa chỉ
    const [userRows] = await db.query(
      `
      SELECT 
        u.*, 
        a.province, 
        a.district, 
        a.ward, 
        a.specific_address
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.is_deleted = 'false' AND u.id_user = ?;
    `,
      [id]
    );

    if (!userRows || userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Thông tin khách hàng không tồn tại" });
    }

    const user = userRows[0];

    // // Truy ngược lại ID từ tên tỉnh/thành, quận/huyện, phường/xã
    const [[provinceRow]] = await db.query(
      `SELECT id FROM province WHERE _name = ? LIMIT 1`,
      [user.province]
    );

    const [[districtRow]] = await db.query(
      `SELECT id FROM district WHERE _name = ? LIMIT 1`,
      [userRows[0].district]
    );

    const [[wardRow]] = await db.query(
      `SELECT id FROM ward WHERE _name = ? LIMIT 1`,
      [user.ward]
    );

    // Trả về thông tin người dùng kèm theo ID tỉnh, huyện, xã
    res.json({
      message: "Lấy thông tin thành công",
      data: {
        ...user,
        province_id: provinceRow?.id || null,
        district_id: districtRow?.id || null,
        ward_id: wardRow?.id || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { id } = verifyToken(refreshToken);
    const accessToken = generateAccessToken(id);
    res.json({ accessToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi làm mới token", error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const { id } = verifyToken(refreshToken);
    const accessToken = generateAccessToken(id);
    res.json({ accessToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi làm mới token", error: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const sql = "SELECT * FROM user"; // Truy vấn lấy danh sách tất cả người dùng
    const [rows] = await db.query(sql); // Dùng await để lấy dữ liệu

    res.json(rows); // Trả về danh sách user
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
