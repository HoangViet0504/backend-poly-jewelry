const db = require("../config/connectDb");

exports.getListOrdersAdmin = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [vouChersRows] = await db.query(`
            SELECT 
        * 
      FROM 
        orders INNER JOIN order_detail ON orders.id = order_detail.id_order
  
          `);

    res.json({
      message: "Lấy đơn hàng thành công",
      data: vouChersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy đơn hàng",
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
