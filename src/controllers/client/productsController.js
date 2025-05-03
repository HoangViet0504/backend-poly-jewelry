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
    console.log(keyword);

    const limit = 20;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * limit;

    // Lấy ID danh mục và loại danh mục từ slug
    const [getId] = await db.query(
      "SELECT id_categories, type FROM categories WHERE slug_categories = ?",
      [slug]
    );

    const category = getId[0];

    if (!category) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    const idCategory = category.id_categories;
    const categoryType = category.type; // Loại danh mục (category hoặc collection)

    // Câu truy vấn cơ bản
    let baseQuery = "FROM products WHERE ";
    const params = [];

    // Lọc theo loại danh mục
    if (categoryType === "collection") {
      // Nếu là collection, dùng `id_collection`
      baseQuery += "id_collection = ?";
      params.push(idCategory);
    } else {
      // Nếu là category, dùng `id_category`
      baseQuery += "id_category = ?";
      params.push(idCategory);
    }

    // Filter theo chất liệu
    if (material) {
      baseQuery += " AND made = ?";
      params.push(material);
    }

    // Filter theo keyword nếu có và hợp lệ
    if (keyword && keyword.trim() !== "") {
      const keywordValue = `%${keyword.trim()}%`;
      baseQuery += " AND name_product LIKE ?";
      params.push(keywordValue);
    }

    // Xử lý sắp xếp
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

    // Lấy tổng số sản phẩm
    const [countRows] = await db.query(
      `SELECT COUNT(*) as total ${baseQuery}`,
      params
    );
    const totalItems = countRows[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy danh sách sản phẩm có phân trang
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

exports.getListProductCollection = async (req, res) => {
  try {
    const [response] = await db.query(
      "SELECT * FROM products WHERE quantity > 0 AND id_collection IS NOT NULL ORDER BY id DESC LIMIT 20"
    );
    return res.status(200).json({
      message: "Lấy sản phẩm thành công",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getGroupedImageProductsDetail = async (req, res) => {
  try {
    // Lấy danh sách ảnh và thông tin sản phẩm không có phân trang
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
    `;

    // Thực hiện query để lấy dữ liệu
    const [rows] = await db.query(query);

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
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách ảnh và sản phẩm",
      error: error.message,
    });
  }
};
