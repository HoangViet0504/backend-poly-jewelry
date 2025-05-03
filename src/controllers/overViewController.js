const db = require("../config/connectDb");

exports.getRevenueLast30Days = async (req, res) => {
  try {
    const query = `
      SELECT 
        SUM(total_amount) AS total_revenue
      FROM 
        orders
      WHERE 
        created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND created_at <= NOW()
        AND status = 'success'
    `;

    const [[{ total_revenue }]] = await db.query(query);

    res.json({
      message: "Tổng doanh thu trong 30 ngày (đơn thành công)",
      totalRevenue: total_revenue || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thống kê doanh thu",
      error: error.message,
    });
  }
};

exports.getTotalOrdersLast30Days = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) AS total_orders
      FROM 
        orders
      WHERE 
        created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND created_at <= NOW()
    `;

    const [[{ total_orders }]] = await db.query(query);

    res.json({
      message: "Tổng số đơn hàng trong 30 ngày qua",
      totalOrders: total_orders || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thống kê số lượng đơn hàng",
      error: error.message,
    });
  }
};

exports.getNewProductCountLast30Days = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS new_product_count
      FROM products
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        AND created_at <= NOW()
    `;

    const [[{ new_product_count }]] = await db.query(query);

    res.json({
      message: "Số lượng sản phẩm mới trong 30 ngày qua",
      data: new_product_count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thống kê sản phẩm mới",
      error: error.message,
    });
  }
};

exports.getVoucherStatsLast30Days = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS total_vouchers
      FROM vouchers
      WHERE start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `;

    const [[{ total_vouchers }]] = await db.query(query);

    res.json({
      message: "Tổng số lượng voucher trong 30 ngày gần nhất",
      data: total_vouchers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thống kê voucher",
      error: error.message,
    });
  }
};

exports.getRevenueChartByMode = async (req, res) => {
  try {
    const mode = req.query.mode || "day"; // default is "day"
    const validModes = ["week", "month", "year"];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ message: "Chế độ không hợp lệ" });
    }

    let groupBy = "";
    let dateFormat = "";

    if (mode === "week") {
      groupBy = "YEAR(created_at), WEEK(created_at)";
      dateFormat =
        "CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at), 2, '0'))";
    } else if (mode === "month") {
      groupBy = "YEAR(created_at), MONTH(created_at)";
      dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
    } else if (mode === "year") {
      groupBy = "YEAR(created_at)";
      dateFormat = "YEAR(created_at)";
    }

    const query = `
      SELECT 
        ${dateFormat} AS date,
        SUM(total_amount) AS revenue
      FROM orders
      WHERE status = 'success'
        AND created_at BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 YEAR) AND CURDATE()
      GROUP BY ${groupBy}
      ORDER BY date ASC
    `;

    const [rows] = await db.query(query);

    res.json({
      message: "Thống kê doanh thu thành công",
      data: rows, // [{ date: '2025-W17', revenue: 200000 }, ...]
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thống kê doanh thu",
      error: error.message,
    });
  }
};

exports.getProductSale = async (req, res) => {
  try {
    const [response] = await db.query(
      "Select * from products ORDER BY sale_quantity DESC LIMIT 5 "
    );
    return res.status(200).json({
      message: "Lấy danh sách sản phẩm bán chạy thành công",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm bán chạy",
      error: error.message,
    });
  }
};

exports.getOrderNew = async (req, res) => {
  try {
    const [response] = await db.query(
      "SELECT COUNT(*) AS total FROM orders WHERE status = 'paying'"
    );
    return res.status(200).json({
      message: "Lấy số lượng đơn hàng mới thành công",
      data: response[0].total,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy số lượng đơn hàng mới",
      error: error.message,
    });
  }
};
