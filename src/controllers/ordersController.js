const db = require("../config/connectDb");

exports.getHistoryCartAdmin = async (req, res) => {
  try {
    const {
      keyword = "",
      status,
      payment_method,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    // Tạo điều kiện WHERE
    let where = "WHERE 1=1";
    const values = [];

    if (keyword) {
      where += " AND (orders.email LIKE ? OR orders.phone LIKE ?)";
      values.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (status) {
      where += " AND orders.status = ?";
      values.push(status);
    }

    if (payment_method) {
      where += " AND orders.payment_method = ?";
      values.push(payment_method);
    }

    // Đếm tổng số bản ghi
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM orders 
       INNER JOIN order_detail ON orders.id = order_detail.id_order 
       ${where}`,
      values
    );
    const total = countResult[0].total;

    // Lấy dữ liệu có phân trang
    const [response] = await db.query(
      `SELECT * FROM orders 
       INNER JOIN order_detail ON orders.id = order_detail.id_order 
       ${where} 
       ORDER BY orders.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...values, limitNumber, offset]
    );

    return res.json({
      message: "Lấy lịch sử đơn hàng thành công",
      data: response,
      meta: {
        totalItems: total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        perPage: limitNumber,
        showing: `Hiển thị từ ${offset + 1} đến ${
          offset + response.length
        } của ${total} bản ghi`,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy lịch sử đơn hàng",
      error: error.message,
    });
  }
};

exports.getListOrdersAdminByKeyWord = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    let OrdersRows;

    if (keyword === "") {
      // Nếu không có keyword, lấy tất cả người dùng (không bị xóa)
      [OrdersRows] = await db.query(`
     SELECT  * FROM orders JOIN order_detail ON orders.id = order_detail.id_order JOIN products ON order_detail.id_product = products.id;
      `);
    } else {
      // Nếu có keyword, lọc theo tên, email hoặc số điện thoại
      [OrdersRows] = await db.query(
        `
      SELECT  * FROM orders JOIN order_detail ON orders.id = order_detail.id_order JOIN products ON order_detail.id_product = products.id
          WHERE (
            products.name LIKE ? 
          )
        `,
        [`%${keyword}%`]
      );
    }

    res.json({
      message: "Lấy đơn hàng thành công",
      data: OrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy đơn hàng",
      error: error.message,
    });
  }
};

exports.getOrdersAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    // Truy vấn thông tin người dùng và địa chỉ
    const [ordersRows] = await db.query(
      `
      SELECT 
      * FROM orders INNER JOIN order_detail ON orders.id = order_detail.id_order
      JOIN products ON order_detail.id_product = products.id
      WHERE  orders.id = ?; 
    `,
      [id]
    );

    res.json({
      message: "Lấy thông tin khuyến mãi thành công",
      data: ordersRows[0] ?? {},
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin khuyến mãi",
      error: error.message,
    });
  }
};

exports.UpdateOrdersAdmin = async (req, res) => {
  try {
    const { id, status } = req.body;

    // Kiểm tra thông tin bắt buộc

    await db.query("UPDATE orders SET  status=? WHERE id = ?", [status, id]);
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM orders  WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: resultOrdersRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin khuyến mãi",
      error: error.message,
    });
  }
};
