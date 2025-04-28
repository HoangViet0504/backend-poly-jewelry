const db = require("../../config/connectDB");

exports.getListProductsSaleDescClient = async (req, res) => {
  try {
    // Lấy sản phẩm phân trang
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM products WHERE quantity > 0 ORDER BY sale_quantity DESC LIMIT 20 "
    );

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

exports.getListProductsSaleClient = async (req, res) => {
  try {
    // Lấy sản phẩm phân trang
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM products WHERE price_sale != 0 AND quantity > 0 ORDER BY created_at DESC LIMIT 8"
    );

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

exports.getListProductsCreateDescClient = async (req, res) => {
  try {
    // Lấy sản phẩm phân trang
    const [resultOrdersRows] = await db.query(
      "SELECT * FROM products WHERE quantity > 0 ORDER BY created_at DESC LIMIT 20"
    );

    res.status(200).json({
      message: "Lấy danh sách sản phẩm thành công",
      data: resultOrdersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
};

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
      "SELECT * FROM products WHERE id_category = ? AND quantity > 0 LIMIT ? OFFSET ?",
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
    const { slug, material, sort, page = 1, keyword } = req.query;

    const limit = 20;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * limit;

    const [getId] = await db.query(
      "SELECT id_categories FROM categories WHERE slug_categories = ? ",
      [slug]
    );

    const idCategory = getId[0]?.id_categories;

    if (!idCategory) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    let baseQuery = "FROM products WHERE id_category = ?";
    const params = [idCategory];

    // Filter theo chất liệu nếu có
    if (material) {
      baseQuery += " AND made = ?";
      params.push(material);
    }

    if (keyword !== "") {
      baseQuery += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // Điều kiện sắp xếp
    let orderBy = "";
    if (sort) {
      switch (sort) {
        case "price_asc":
          orderBy = " ORDER BY price ASC";
          break;
        case "price_desc":
          orderBy = " ORDER BY price DESC";
          break;
        case "purchases":
          orderBy = " ORDER BY sale_quantity DESC";
          break;
        case "likes":
          orderBy = " ORDER BY likes DESC";
          break;
        case "sale":
          baseQuery += " AND price_sale > 0";
          break;
        default:
          break;
      }
    }

    // Lấy tổng số sản phẩm (trước khi phân trang)
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      params
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy sản phẩm có phân trang
    const [resultProductsRows] = await db.query(
      `SELECT * ${baseQuery} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const startItem = offset + 1;
    const endItem = Math.min(offset + limit, totalItems);
    res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: resultProductsRows,
      meta: {
        totalItems,
        currentPage,
        totalPages,
        perPage: limit,
        showing: `Showing ${startItem} to ${endItem} of ${totalItems} results`,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

// exports.getProductDetail = async (req, res) => {
//   try {
//     const { slug } = req.query;
//     const [getProduct] = await db.query(
//       "SELECT * FROM products LEFT JOIN categories ON categories.id_categories = products.id_category WHERE products.slug = ?",
//       [slug]
//     );
//     const [getImage] = await db.query(
//       "SELECT * FROM image_product WHERE id_product = ?",
//       [getProduct[0].id]
//     );
//     res.status(200).json({
//       message: "Lấy sản phẩm thành công",
//       data: {
//         ...getProduct[0],
//         image_product: [...getImage],
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi lấy sản phẩm",
//       error: error.message,
//     });
//   }
// };

exports.getProductDetail = async (req, res) => {
  try {
    const { slug } = req.query;
    const [getProduct] = await db.query(
      `SELECT * 
       FROM products 
       LEFT JOIN categories 
       ON categories.id_categories = products.id_category 
       WHERE products.slug = ?`,
      [slug]
    );

    const [getImage] = await db.query(
      "SELECT * FROM image_product WHERE id_products = ?",
      [getProduct[0].id]
    );

    // Lấy danh sách ảnh (chỉ lấy trường image)
    const images = getImage.map((img) => img.image);

    res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: {
        ...getProduct[0],
        listImage: images,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getProductSameIdCategories = async (req, res) => {
  try {
    const { slug } = req.query;
    const [id] = await db.query("SELECT * FROM products WHERE slug = ?", [
      slug,
    ]);
    const [getProduct] = await db.query(
      "SELECT * FROM products WHERE id_category = ?  AND quantity > 0",
      [id[0].id_category]
    );
    res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: getProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getProductFavorite = async (req, res) => {
  try {
    const { id_user } = req.query;
    const [response] = await db.query(
      "SELECT * FROM favorite WHERE id_user = ?",
      [id_user]
    );
    console.log(response);

    return res.status(200).json({
      message: "Lấy sản phẩm yêu thích thành công",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm yêu thích",
      error: error.message,
    });
  }
};

exports.getListProductFavoriteByUser = async (req, res) => {
  try {
    const { id_user } = req.query;
    const [response] = await db.query(
      "SELECT * FROM favorite INNER JOIN products ON products.id = favorite.id_product WHERE favorite.id_user = ?",
      [id_user]
    );
    return res.status(200).json({
      message: "Lấy sản phẩm yêu thích thành công",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm yêu thích",
      error: error.message,
    });
  }
};

exports.addProductFavorite = async (req, res) => {
  try {
    const { id_user, id_product } = req.body;
    // 1. Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
    const [existingFavorite] = await db.query(
      "SELECT * FROM favorite WHERE id_user = ? AND id_product = ?",
      [id_user, id_product]
    );

    if (existingFavorite.length > 0) {
      // 2. Nếu đã tồn tại → xóa (unfavorite)
      await db.query(
        "DELETE FROM favorite WHERE id_user = ? AND id_product = ?",
        [id_user, id_product]
      );
      const [favorites] = await db.query(
        `SELECT id_product
         FROM favorite
         WHERE favorite.id_user = ?`,
        [id_user]
      );
      return res.status(200).json({
        message: "Đã xóa sản phẩm khỏi danh sách yêu thích",
        data: favorites,
      });
    } else {
      // 3. Nếu chưa tồn tại → thêm mới (favorite)
      // Trước khi insert, kiểm tra xem id_product có tồn tại không
      const [product] = await db.query("SELECT id FROM products WHERE id = ?", [
        id_product,
      ]);

      if (product.length === 0) {
        return res.status(400).json({
          message: "Sản phẩm không tồn tại",
        });
      }

      await db.query(
        "INSERT INTO favorite (id_user, id_product) VALUES (?, ?)",
        [id_user, id_product]
      );

      const [favorites] = await db.query(
        `SELECT id_product
         FROM favorite
         WHERE favorite.id_user = ?`,
        [id_user]
      );
      return res.status(200).json({
        message: "Thêm sản phẩm vào danh sách yêu thích thành công",
        data: favorites,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi xử lý yêu thích sản phẩm",
      error: error.message,
    });
  }
};
