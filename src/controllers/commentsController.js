const db = require("../config/connectDb");

exports.getListCommentsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "", rate } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    // Build điều kiện WHERE
    let whereClause = `WHERE 1=1`;
    const queryParams = [];

    if (keyword) {
      whereClause += `
        AND (
          comments.content LIKE ? 
          OR products.name_product LIKE ? 
          OR user.first_name LIKE ? 
          OR user.last_name LIKE ?
        )
      `;
      const searchKeyword = `%${keyword}%`;
      queryParams.push(
        searchKeyword,
        searchKeyword,
        searchKeyword,
        searchKeyword
      );
    }

    if (rate !== undefined && rate !== "") {
      whereClause += ` AND comments.rating = ?`;
      queryParams.push(rate);
    }

    // Query tổng số bản ghi
    const [totalRows] = await db.query(
      `SELECT COUNT(*) as total
       FROM comments 
       JOIN user ON comments.id_user = user.id_user
       JOIN products ON comments.id_product = products.id
       ${whereClause}`,
      queryParams
    );
    const total = totalRows[0].total;

    // Query lấy dữ liệu phân trang
    const [comments] = await db.query(
      `SELECT 
          comments.*, 
          user.first_name, 
          user.last_name, 
          products.name_product AS product_name
       FROM 
          comments 
       JOIN 
          user ON comments.id_user = user.id_user
       JOIN 
          products ON comments.id_product = products.id
       ${whereClause}
       ORDER BY comments.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limitNumber, offset]
    );

    res.status(200).json({
      message: "Lấy danh sách bình luận thành công",
      data: comments,
      meta: {
        totalItems: total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        perPage: limitNumber,
        showing: `Hiển thị từ ${offset + 1} đến ${
          offset + comments.length
        } của ${total} bản ghi`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách bình luận",
      error: error.message,
    });
  }
};

exports.DeleteCommentAdmin = async (req, res) => {
  try {
    const { id } = req.body;
    // Xóa comment
    await db.query("DELETE FROM comments WHERE id = ?", [id]);

    res.status(200).json({ message: "Xóa comment thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa comment",
      error: error.message,
    });
  }
};
