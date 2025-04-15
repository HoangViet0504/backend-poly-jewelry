const db = require("../../config/connectDB");

exports.getListCategories = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [categoriesRows] = await db.query(`
            SELECT 
        * 
      FROM 
        categories
        WHERE  categories.is_deleted = 'false'
          `);

    res.json({
      message: "Lấy danh mục thành công",
      data: categoriesRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh mục",
      error: error.message,
    });
  }
};
