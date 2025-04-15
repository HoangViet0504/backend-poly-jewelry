const db = require("../../config/connectDB");

exports.getListProductsByCategoriesClient = async (req, res) => {
  try {
    const { id, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Lấy tổng số sản phẩm
    const [countRows] = await db.query(
      "SELECT COUNT(*) as total FROM products WHERE id_category = ?",
      [id]
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy sản phẩm phân trang
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM products WHERE id_category = ? LIMIT ? OFFSET ?",
      [id, Number(limit), Number(offset)]
    );

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: resultOrdersRows,
      meta: {
        currentPage: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

exports.getListProductsBySlugClient = async (req, res) => {
  try {
    const { slug } = req.query;

    // Lấy sản phẩm phân trang
    const [resultProductsRows] = await db.query(
      "SELECT * FROM products WHERE slug = ? ",
      [slug]
    );

    res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: resultProductsRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};
