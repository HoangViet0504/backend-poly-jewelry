const db = require("../../config/connectDb");
const bcrypt = require("bcrypt");

exports.UpdateUser = async (req, res) => {
  try {
    const {
      id,
      first_name,
      last_name,
      phone,
      avatar_img,
      province,
      district,
      ward,
      email,
      birthdate,
      specific_address,
    } = req.body;
    const [getUser] = await db.query("SELECT * FROM user WHERE id_user = ?", [
      id,
    ]);
    if (phone !== getUser[0].phone) {
      const [phoneCheck] = await db.query(
        "SELECT * FROM user WHERE phone = ?",
        [phone]
      );
      if (phoneCheck.length > 0) {
        return res.status(400).json({
          message: "Số điện thoại đã được sử dụng ",
        });
      }
    }

    // Kiểm tra email nếu có
    if (email !== getUser[0].email) {
      const [emailCheck] = await db.query(
        "SELECT * FROM user WHERE email = ? ",
        [email]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: "Email đã được sử dụng " });
      }
    }
    await db.query(
      "UPDATE user SET first_name= ? , last_name = ?, phone = ? ,avatar_img=?,birthdate=?,email=? WHERE id_user = ?",
      [first_name, last_name, phone, avatar_img, birthdate, email, id]
    );
    const [checkAddress] = await db.query(
      "SELECT * FROM address WHERE id_user = ?",
      [id]
    );
    if (checkAddress.length === 0) {
      await db.query(
        "INSERT INTO address (id_user, province, district, ward, specific_address) VALUES (?, ?, ?, ?, ?)",
        [id, province, district, ward, specific_address]
      );
    } else {
      await db.query(
        "UPDATE address SET province = ?, district = ?, ward = ?, specific_address = ? WHERE id_user = ?",
        [province, district, ward, specific_address, id]
      );
    }
    const [resultUserRows] = await db.query(
      "SELECT * FROM user LEFT JOIN address ON user.id_user = address.id_user WHERE user.id_user  = ?",
      [id]
    );
    const [[provinceRow]] = await db.query(
      `SELECT id FROM province WHERE _name = ? LIMIT 1`,
      [resultUserRows[0].province]
    );

    const [[districtRow]] = await db.query(
      `SELECT id FROM district WHERE _name = ? LIMIT 1`,
      [resultUserRows[0].district]
    );

    const [[wardRow]] = await db.query(
      `SELECT id FROM ward WHERE _name = ? LIMIT 1`,
      [resultUserRows[0].ward]
    );
    res.status(200).json({
      message: "Cập nhật thông tin khách hàng thành công",
      data: {
        ...resultUserRows[0],
        province_id: provinceRow?.id || null,
        district_id: districtRow?.id || null,
        ward_id: wardRow?.id || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin khách hàng",
      error: error.message,
    });
  }
};

exports.UpdatePassword = async (req, res) => {
  try {
    const { id, password, currentPassword } = req.body;

    const [rows] = await db.query("SELECT * FROM user WHERE id_user = ?", [id]);
    const user = rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("UPDATE user SET password= ? WHERE id_user = ?", [
      hashedPassword,
      id,
    ]);

    res.status(200).json({
      message: "Cập nhật mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật mật khẩu",
      error: error.message,
    });
  }
};

exports.getListOrdersClient = async (req, res) => {
  try {
    const { id } = req.query;
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM orders  WHERE id_user = ?",
      [id]
    );

    res.status(200).json({
      message: "Lấy danh sách đơn hàng thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

exports.getListOrdersDetailClient = async (req, res) => {
  try {
    const { id_user, id_order } = req.query;
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM orders INNER JOIN order_detail ON orders.id = order_detail.id_order  WHERE id_user = ? AND id_order = ?",
      [id_user, id_order]
    );

    res.status(200).json({
      message: "Lấy đơn hàng thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy đơn hàng",
      error: error.message,
    });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.query;
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM address  WHERE id_user = ?",
      [id]
    );

    res.status(200).json({
      message: "Lấy địa chỉ thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy địa chỉ",
      error: error.message,
    });
  }
};
