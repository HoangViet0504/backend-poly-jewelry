const db = require("../../config/connectDb");
exports.getCommentByIdProduct = async (req, res) => {
  try {
    const { slug } = req.query;

    // Truy vấn thông tin người dùng từ database
    const [getIdProduct] = await db.query(
      "SELECT * FROM products WHERE slug = ?",
      [slug]
    );
    const [categoriesRows] = await db.query(
      `
      SELECT 
        * 
      FROM 
        comments
        INNER JOIN user ON comments.id_user = user.id_user
        WHERE  id_product = ?
          `,
      [getIdProduct[0].id]
    );

    res.json({
      message: "Lấy bình luận thành công",
      data: categoriesRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy bình luận",
      error: error.message,
    });
  }
};

exports.postCommentByIdProduct = async (req, res) => {
  try {
    const { id_product, id_user, rating, content } = req.body;

    const [result] = await db.query(
      "INSERT INTO comments (id_product, id_user, rating, content,created_at) VALUES (?, ?, ?, ?,NOW())",
      [id_product, id_user, rating, content]
    );

    const [getComment] = await db.query(
      "SELECT * FROM comments INNER JOIN user ON user.id_user = comments.id_user WHERE id = ?",
      [result.insertId]
    );

    res.json({
      message: "Thêm bình luận thành công",
      data: getComment[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm bình luận",
      error: error.message,
    });
  }
};
