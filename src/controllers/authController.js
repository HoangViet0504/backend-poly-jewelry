const db = require("../config/connectDb");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // Thêm để tạo OTP ngẫu nhiên

const {
  sendRegisterEmail,
  sendEmailForgotPassword,
} = require("../utils/helper/sendEmail");
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
    await sendRegisterEmail(email); // Gửi email xác nhận
    res.json({
      message: "Đăng ký thành công",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error: error.message });
  }
};

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const [userRows] = await db.query(
//       "SELECT * FROM user WHERE user.email = ?",
//       [email]
//     );

//     if (userRows.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "Email hoặc mật khẩu không đúng" });
//     }
//     const user = userRows[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ message: "Email hoặc mật khẩu không đúng" });
//     }
//     res.json({
//       message: "Đăng nhập thành công",
//       data: user,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Lỗi khi đăng nhập", error: error.message });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [userRows] = await db.query(
      "SELECT * FROM user WHERE user.email = ?",
      [email]
    );

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

    // Tạo token mới
    const token = jwt.sign(
      { id: user.id_user, email, role: 2 },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    // Lưu token mới vào database
    await db.query("UPDATE user SET access_token = ? WHERE id_user = ?", [
      token,
      user.id_user,
    ]);

    res.json({
      message: "Đăng nhập thành công",
      data: user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

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

exports.checkEmailRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra xem email có tồn tại trong bảng user không
    const [userRows] = await db.query(
      "SELECT * FROM user WHERE user.email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Email của bạn không tồn tại" });
    }

    // Kiểm tra xem OTP đã tồn tại cho email này chưa
    const [checkOtp] = await db.query("SELECT * FROM otp WHERE email = ?", [
      email,
    ]);

    // Tạo OTP ngẫu nhiên 6 chữ số
    const otp = crypto.randomInt(100000, 999999).toString(); // tạo OTP từ 6 chữ số

    if (checkOtp.length > 0) {
      // Nếu OTP đã tồn tại cho email này, xóa OTP cũ và cập nhật OTP mới
      await db.query("DELETE FROM otp WHERE email = ?", [email]);
    }

    // Lưu OTP mới vào bảng otp
    await db.query("INSERT INTO otp (email, otp) VALUES (?, ?)", [email, otp]);
    await sendEmailForgotPassword(email, otp); // Gửi email chứa OTP
    // Gửi OTP mới cho người dùng (có thể sử dụng thư viện gửi email như nodemailer)

    res.json({
      message: "OTP mới đã được gửi đến email của bạn",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xử lý yêu cầu", error: error.message });
  }
};

exports.updatePasswordRequest = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Kiểm tra email có tồn tại không
    const [userRows] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Email không tồn tại." });
    }

    // Kiểm tra OTP
    const [otpRows] = await db.query(
      "SELECT * FROM otp WHERE email = ? AND otp = ?",
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ message: "OTP không hợp lệ." });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cập nhật mật khẩu mới vào DB
    await db.query("UPDATE user SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // Xóa OTP sau khi đổi mật khẩu thành công
    await db.query("DELETE FROM otp WHERE email = ?", [email]);

    res.json({ message: "Cập nhật mật khẩu thành công." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật mật khẩu", error: error.message });
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
