const db = require("../config/connectDb");

exports.getListProductsAdmin = async (req, res) => {
  try {
    const {
      keyword = "",
      made = "",
      id_category = "",
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        products.*, 
        categories.name AS category_name
      FROM 
        products
      LEFT JOIN 
        categories ON categories.id_categories = products.id_category
      WHERE 
        products.is_deleted = 'false'
    `;

    const params = [];

    // Thêm các điều kiện nếu có
    if (keyword?.trim()) {
      query += ` AND products.name_product LIKE ? `;
      params.push(`%${keyword}%`);
    }

    if (made?.trim()) {
      query += ` AND products.made = ? `;
      params.push(made);
    }

    if (id_category?.trim()) {
      query += ` AND products.id_category = ? `;
      params.push(id_category);
    }

    if (status?.trim()) {
      query += ` AND products.status = ? `;
      params.push(status);
    }

    query += ` ORDER BY products.id DESC LIMIT ? OFFSET ? `;
    params.push(parseInt(limit), parseInt(offset));

    const [productsRows] = await db.query(query, params);

    // Đếm tổng số sản phẩm (KHÔNG cần join categories khi count)
    let countQuery = `
      SELECT 
        COUNT(*) as total
      FROM 
        products
      WHERE 
        products.is_deleted = 'false'
    `;

    const countParams = [];

    if (keyword?.trim()) {
      countQuery += ` AND products.name_product LIKE ? `;
      countParams.push(`%${keyword}%`);
    }

    if (made?.trim()) {
      countQuery += ` AND products.made = ? `;
      countParams.push(made);
    }

    if (id_category?.trim()) {
      countQuery += ` AND products.id_category = ? `;
      countParams.push(id_category);
    }

    if (status?.trim()) {
      countQuery += ` AND products.status = ? `;
      countParams.push(status);
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({
      message: "Lấy sản phẩm thành công",
      data: productsRows,
      meta: {
        totalItems: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        perPage: parseInt(limit),
        showing:
          total > 0
            ? `Hiển thị từ ${offset + 1} đến ${
                offset + productsRows.length
              } của ${total} sản phẩm`
            : "Không có sản phẩm nào",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getListProductsCollectionAdmin = async (req, res) => {
  try {
    const {
      keyword = "",
      made = "",
      id_category = "",
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        products.*, 
        categories.name AS category_name
      FROM 
        products
      LEFT JOIN 
        categories ON categories.id_categories = products.id_category
      WHERE 
        products.is_deleted = 'false' AND products.id_collection IS NOT NULL

    `;

    const params = [];

    // Thêm các điều kiện nếu có
    if (keyword?.trim()) {
      query += ` AND products.name_product LIKE ? `;
      params.push(`%${keyword}%`);
    }

    if (made?.trim()) {
      query += ` AND products.made = ? `;
      params.push(made);
    }

    if (id_category?.trim()) {
      query += ` AND products.id_category = ? `;
      params.push(id_category);
    }

    if (status?.trim()) {
      query += ` AND products.status = ? `;
      params.push(status);
    }

    query += ` ORDER BY products.id DESC LIMIT ? OFFSET ? `;
    params.push(parseInt(limit), parseInt(offset));

    const [productsRows] = await db.query(query, params);

    // Đếm tổng số sản phẩm (KHÔNG cần join categories khi count)
    let countQuery = `
      SELECT 
        COUNT(*) as total
      FROM 
        products
      WHERE 
        products.is_deleted = 'false' AND products.id_collection IS NOT NULL
    `;

    const countParams = [];

    if (keyword?.trim()) {
      countQuery += ` AND products.name_product LIKE ? `;
      countParams.push(`%${keyword}%`);
    }

    if (made?.trim()) {
      countQuery += ` AND products.made = ? `;
      countParams.push(made);
    }

    if (id_category?.trim()) {
      countQuery += ` AND products.id_category = ? `;
      countParams.push(id_category);
    }

    if (status?.trim()) {
      countQuery += ` AND products.status = ? `;
      countParams.push(status);
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({
      message: "Lấy sản phẩm thành công",
      data: productsRows,
      meta: {
        totalItems: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        perPage: parseInt(limit),
        showing:
          total > 0
            ? `Hiển thị từ ${offset + 1} đến ${
                offset + productsRows.length
              } của ${total} sản phẩm`
            : "Không có sản phẩm nào",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getListProductsAdminByKeyWord = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    let productsRows;

    if (keyword === "") {
      // Nếu không có keyword, lấy tất cả người dùng (không bị xóa)
      [productsRows] = await db.query(`
     SELECT  * FROM products WHERE is_deleted = 'false';
      `);
    } else {
      // Nếu có keyword, lọc theo tên, email hoặc số điện thoại
      [productsRows] = await db.query(
        `
      SELECT 
        * FROM products WHERE is_deleted = 'false' 
          AND (
            name LIKE ? 
          )
        `,
        [`%${keyword}%`]
      );
    }

    res.json({
      message: "Lấy sản phẩm thành công",
      data: productsRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm ",
      error: error.message,
    });
  }
};

exports.getListProductsRemoveAdmin = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [productsRows] = await db.query(`
      SELECT * FROM products WHERE is_deleted = 'true';
    `);

    if (productsRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Danh sách sản phẩm không tồn tại" });
    }

    // Trả về thông tin người dùng
    res.json({
      message: "Lấy sản phẩm thành công",
      data: productsRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm",
      error: error.message,
    });
  }
};

exports.getProductAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    // Truy vấn thông tin người dùng và địa chỉ
    const [productsRows] = await db.query(
      `
      SELECT 
      * FROM products 
      WHERE is_deleted = 'false' AND id = ?;
    `,
      [id]
    );

    if (!productsRows || productsRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Thông tin sản phẩm không tồn tại" });
    }
    // Trả về thông tin người dùng kèm theo ID tỉnh, huyện, xã
    res.json({
      message: "Lấy thông tin sản phẩm thành công",
      data: productsRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin sản phẩm",
      error: error.message,
    });
  }
};

// exports.AddProductsAdmin = async (req, res) => {
//   try {
//     const {
//       id_categories,
//       id_collection,
//       name_product,
//       short_description,
//       description,
//       quantity,
//       status,
//       primary_image,
//       price,
//       price_sale,
//       made,
//     } = req.body;

//     // Kiểm tra email đã tồn tại chưa
//     const [existingProducts] = await db.query(
//       "SELECT * FROM products WHERE name_product = ?",
//       [name_product]
//     );

//     if (existingProducts.length > 0) {
//       return res.status(409).json({ message: "Tên sản phẩm đã tồn tại" });
//     }
//     // Chuyển name thành slug
//     const slug = name_product
//       .toLowerCase()
//       .normalize("NFD") // Bỏ dấu tiếng Việt
//       .replace(/[\u0300-\u036f]/g, "") // Loại bỏ ký tự dấu
//       .replace(/[^a-z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
//       .trim() // Bỏ khoảng trắng đầu/cuối
//       .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang

//     const [result] = await db.query(
//       "INSERT INTO products (id_category,id_collection, name_product,short_description,description,quantity,status,primary_image,price,price_sale,made,slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
//       [
//         id_categories,
//         id_collection,
//         name_product,
//         short_description,
//         description,
//         quantity | 0,
//         status,
//         primary_image,
//         price,
//         price_sale,
//         made,
//         slug,
//       ]
//     );

//     const [newProductsRows] = await db.query(
//       "SELECT * FROM products JOIN categories ON products.id_category = categories.id_categories WHERE id = ?",
//       [result.insertId]
//     );
//     res.status(201).json({
//       message: "Thêm sản phẩm thành công",
//       data: newProductsRows[0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi thêm sản phẩm",
//       error: error.message,
//     });
//   }
// };

exports.AddProductsAdmin = async (req, res) => {
  try {
    const {
      id_categories,
      id_collection,
      name_product,
      short_description,
      description,
      quantity,
      status,
      primary_image,
      price,
      price_sale,
      made,
      size, // thêm size
    } = req.body;

    // Kiểm tra sản phẩm đã tồn tại chưa
    const [existingProducts] = await db.query(
      "SELECT * FROM products WHERE name_product = ?",
      [name_product]
    );

    if (existingProducts.length > 0) {
      return res.status(409).json({ message: "Tên sản phẩm đã tồn tại" });
    }

    // Chuyển name thành slug
    const slug = name_product
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    // Insert sản phẩm mới
    const [result] = await db.query(
      `INSERT INTO products 
        (id_category, id_collection, name_product, short_description, description, quantity, status, primary_image, price, price_sale, made, slug, size) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_categories,
        id_collection,
        name_product,
        short_description,
        description,
        quantity,
        status,
        primary_image,
        price,
        price_sale,
        made,
        slug,
        size, // lưu size
      ]
    );

    // Sau khi thêm xong thì lấy toàn bộ sản phẩm ra
    const [productsRows] = await db.query(
      `
     SELECT 
        products.*, 
        categories.name AS category_name
      FROM 
        products
      LEFT JOIN 
        categories ON categories.id_categories = products.id_category
      WHERE 
        products.is_deleted = 'false' ORDER BY products.id DESC           
    `
    );

    res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: productsRows, // trả list tất cả sản phẩm
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm sản phẩm",
      error: error.message,
    });
  }
};

exports.DeleteProductsAdminByIsDelete = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(id);

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Cập nhật trạng thái is_deleted thành true để thực hiện xóa mềm
    const [result] = await db.query(
      "UPDATE products SET is_deleted = 'true' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "sản phẩm không tồn tại" });
    }

    res.status(200).json({
      message: "Xóa sản phẩm thành công ",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm",
      error: error.message,
    });
  }
};

exports.RevertDeleteProductsAdminByIsDelete = async (req, res) => {
  try {
    const { id, page = 1, limit = 10 } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    await db.query("UPDATE products SET is_deleted = 'false' WHERE id = ?", [
      id,
    ]);
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        products.*, 
        categories.name AS category_name
      FROM 
        products
      LEFT JOIN 
        categories ON categories.id_categories = products.id_category
      WHERE 
        products.is_deleted = 'false'
    `;

    const params = [];

    query += ` ORDER BY products.id DESC LIMIT ? OFFSET ? `;
    params.push(parseInt(limit), parseInt(offset));
    const [productsRows] = await db.query(query, params);

    // Đếm tổng số sản phẩm (KHÔNG cần join categories khi count)
    let countQuery = `
      SELECT 
        COUNT(*) as total
      FROM 
        products
      WHERE 
        products.is_deleted = 'false'
    `;

    const countParams = [];

    const [[{ total }]] = await db.query(countQuery, countParams);

    res.status(200).json({
      message: "Khôi phục sản phẩm thành công",
      data: productsRows,
      meta: {
        totalItems: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        perPage: parseInt(limit),
        showing:
          total > 0
            ? `Hiển thị từ ${offset + 1} đến ${
                offset + productsRows.length
              } của ${total} sản phẩm`
            : "Không có sản phẩm nào",
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi khôi phục sản phẩm",
      error: error.message,
    });
  }
};

exports.DeleteProductsAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Xóa người dùng khỏi cơ sở dữ liệu
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    await db.query("DELETE FROM image_product WHERE id_products = ?", [id]);
    res.status(200).json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm",
      error: error.message,
    });
  }
};

exports.UpdateProductsAdmin = async (req, res) => {
  try {
    const {
      id,
      name,
      id_categories,
      id_collection,
      short_description,
      description,
      quantity,
      status,
      primary_image,
      price,
      price_sale,
      made,
      size,
    } = req.body;

    // Kiểm tra thông tin bắt buộc

    const slug = name
      .toLowerCase()
      .normalize("NFD") // Bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ ký tự dấu
      .replace(/[^a-z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
      .trim() // Bỏ khoảng trắng đầu/cuối
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang
    // Cập nhật thông tin người dùng
    await db.query(
      "UPDATE products SET name_product= ? , id_category = ?,id_collection=?, slug = ?,short_description=?, description=?,quantity=?, status=?,primary_image=?, price=?,price_sale=?,made=?,size=? WHERE id = ?",
      [
        name,
        id_categories,
        id_collection,
        slug,
        short_description,
        description,
        quantity,
        status,
        primary_image,

        price,
        price_sale,
        made,
        size,
        id,
      ]
    );
    const [resultCategoryRows] = await db.query(
      `
            SELECT 
        products.*, 
        categories.name AS category_name
      FROM 
        products
      LEFT JOIN 
        categories ON categories.id_categories = products.id_category
      WHERE 
        products.is_deleted = 'false' AND id = ? ORDER BY products.id DESC`,
      [id]
    );

    res.status(200).json({
      message: "Cập nhật thông tin sản phẩm thành công",
      data: resultCategoryRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin sản phẩm",
      error: error.message,
    });
  }
};
