const db = require("../config/connectDb");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/tokenUtils");
const { comparePassword, hashPassword } = require("../utils/passwordUtils");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    const [userRows] = await db.query(
      `
            SELECT * FROM user WHERE email = ?
        `,
      [email]
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const user = userRows[0];
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

// INSERT INTO `user` (`user_id`, `firstname`, `lastname`, `avatar_img`, `email`, `phone`, `password`, `points`, `street`, `ward`, `district`, `city`, `postal_code`, `role`, `access_token_forgot_password`, `google_auth_id`) VALUES (NULL, 'Hoang', 'Pham', '', 'hoangpham.works@gmail.com', NULL, 'Hoanghocfpt@123', '0', '', '', '', '', NULL, '2', NULL, NULL);
exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    // Kiểm tra email đã tồn tại chưa
    const [userRows] = await db.query(
      `
            SELECT * FROM user WHERE email = ?
        `,
      [email]
    );
    // Nếu đã tồn tại thì trả về thông báo
    if (userRows.length > 0) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Hash mật khẩu
    const hashedPassword = await hashPassword(password);

    // Thêm user vào database
    await db.query(
      `
            INSERT INTO user ( first_name, last_name, avatar_img, email, phone, password, role, access_token_forgot_password)
            VALUES (?, ?, '', ?, NULL, ?, 2, NULL)
        `,
      [first_name, last_name, email, hashedPassword]
    );
    res.json({
      message: "Đăng ký thành công",
      user: { first_name, last_name, email },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error: error.message });
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
    db.query(sql, (err, data) => {
      if (err) {
        return res.status(500).json({
          message: "Lỗi lấy danh sách người dùng",
          error: err.message,
        });
      }
      res.json(data);
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
