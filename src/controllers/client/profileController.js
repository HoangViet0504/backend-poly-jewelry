const db = require("../../config/connectDB");
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
      specific_address,
    } = req.body;

    await db.query(
      "UPDATE user SET first_name= ? , last_name = ?, phone = ? ,avatar_img=?  WHERE id_user = ?",
      [first_name, last_name, phone, avatar_img, id]
    );
    await db.query(
      "UPDATE address SET province = ?, district = ?, ward = ?, specific_address = ? WHERE id_user = ?",
      [province, district, ward, specific_address, id]
    );
    const [resultUserRows] = await db.query(
      "SELECT * FROM user INNER JOIN address ON user.id_user = address.id_user WHERE user.id_user  = ?",
      [id]
    );
    res.status(200).json({
      message: "Cập nhật thông tin khách hàng thành công",
      data: resultUserRows[0],
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
    const { id, password } = req.body;
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
