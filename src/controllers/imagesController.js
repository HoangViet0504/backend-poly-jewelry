const db = require("../config/connectDb");

exports.getGroupedImageProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Lấy danh sách ảnh và thông tin sản phẩm
    const query = `
      SELECT 
        ip.id_image_product, 
        ip.id_products, 
        ip.image,
        p.name_product AS product_name
      FROM 
        image_product ip
      JOIN 
        products p ON ip.id_products = p.id
      ORDER BY 
        ip.id_image_product DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await db.query(query, [limit, offset]);

    // Lấy tổng số ảnh
    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total FROM image_product
    `);

    // Group dữ liệu theo id_products
    const grouped = rows.reduce((acc, item) => {
      const id = item.id_products;

      // Kiểm tra xem đã có id này chưa, nếu chưa thì tạo mới
      if (!acc[id]) {
        acc[id] = {
          id_products: id, // id_products
          product_name: item.product_name, // tên sản phẩm
          images: [],
        };
      }

      // Thêm hình ảnh vào mảng images
      acc[id].images.push({
        id_image_product: item.id_image_product,
        image: item.image,
      });

      return acc;
    }, {});

    // Chuyển đổi object thành mảng để dễ làm việc hơn
    const result = Object.values(grouped);

    res.json({
      message: "Lấy danh sách ảnh và sản phẩm thành công",
      data: result,
      meta: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
        showing:
          total > 0
            ? `Hiển thị từ ${offset + 1} đến ${
                offset + rows.length
              } của ${total} ảnh`
            : "Không có ảnh nào",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ảnh và sản phẩm",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const [response] = await db.query(`SELECT * FROM products`);
    return res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

exports.addImageProduct = async (req, res) => {
  try {
    const { id_products, image } = req.body;

    // Thêm ảnh vào bảng image_product
    const [result] = await db.query(
      `INSERT INTO image_product (id_products, image) VALUES (?, ?)`,
      [id_products, image]
    );

    return res.status(201).json({
      message: "Thêm ảnh sản phẩm thành công",
      data: {
        id_image_product: result.insertId,
        id_products,
        image,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi khi thêm ảnh sản phẩm",
      error: error.message,
    });
  }
};
exports.deletedImageProduct = async (req, res) => {
  try {
    const { id } = req.body;

    // Xóa ảnh trong bảng image_product
    await db.query(`DELETE FROM image_product WHERE id_products = ?`, [id]);

    return res.status(200).json({
      message: "Xóa ảnh sản phẩm thành công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Lỗi khi xóa ảnh sản phẩm",
      error: error.message,
    });
  }
};
