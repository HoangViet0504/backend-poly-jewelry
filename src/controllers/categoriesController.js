const db = require("../config/connectDb");

exports.getListCategoriesAdmin = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [categoriesRows] = await db.query(`
            SELECT 
        * 
      FROM 
        categories
      JOIN 
        image_categories ON categories.id_categories = image_categories.id_categories
        WHERE  categories.is_deleted = 'false'
          `);

    if (categoriesRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Danh sách danh mục không tồn tại" });
    }

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

exports.getListCategoriesAdminByKeyWord = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    let categoriesRows;

    if (keyword === "") {
      // Nếu không có keyword, lấy tất cả người dùng (không bị xóa)
      [categoriesRows] = await db.query(`
     SELECT  * FROM categories WHERE is_deleted = 'false';
      `);
    } else {
      // Nếu có keyword, lọc theo tên, email hoặc số điện thoại
      [categoriesRows] = await db.query(
        `
      SELECT 
        * FROM categories WHERE is_deleted = 'false' 
          AND (
            name LIKE ? 
          )
        `,
        [`%${keyword}%`]
      );
    }

    res.json({
      message: "Lấy danh mục thành công",
      data: categoriesRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh mục ",
      error: error.message,
    });
  }
};

exports.getListCategoriesRemoveAdmin = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [categoriesRows] = await db.query(`
      SELECT * FROM categories WHERE is_deleted = 'true';
    `);

    if (categoriesRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Danh sách danh mục không tồn tại" });
    }

    // Trả về thông tin người dùng
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

exports.getCategoriesAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    // Truy vấn thông tin người dùng và địa chỉ
    const [categoriesRows] = await db.query(
      `
      SELECT 
      * FROM categories 
      WHERE is_deleted = 'false' AND id_categories = ?;
    `,
      [id]
    );

    if (!categoriesRows || categoriesRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Thông tin danh mục không tồn tại" });
    }
    // Trả về thông tin người dùng kèm theo ID tỉnh, huyện, xã
    res.json({
      message: "Lấy thông tin danh mục thành công",
      data: categoriesRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

exports.AddCategoriesAdmin = async (req, res) => {
  try {
    const { name, image_categories } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingCategories] = await db.query(
      "SELECT * FROM categories WHERE name = ?",
      [name]
    );

    if (existingCategories.length > 0) {
      return res.status(409).json({ message: "Tên danh mục đã tồn tại" });
    }
    // Chuyển name thành slug
    const slug = name
      .toLowerCase()
      .normalize("NFD") // Bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ ký tự dấu
      .replace(/[^a-z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
      .trim() // Bỏ khoảng trắng đầu/cuối
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang

    const [result] = await db.query(
      "INSERT INTO categories (name ,image_categories, slug) VALUES (?, ?, ?)",
      [name, image_categories | null, slug]
    );

    const [newCategoryRows] = await db.query(
      "SELECT * FROM categories WHERE id_categories = ?",
      [result.insertId]
    );
    res.status(201).json({
      message: "Thêm danh mục thành công",
      data: newCategoryRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm danh mục",
      error: error.message,
    });
  }
};

exports.DeleteCategoriesAdminByIsDelete = async (req, res) => {
  try {
    const { id } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Cập nhật trạng thái is_deleted thành true để thực hiện xóa mềm
    const [result] = await db.query(
      "UPDATE categories SET is_deleted = 'true' WHERE id_categories = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    res.status(200).json({
      message: "Xóa danh mục thành công ",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa danh mục",
      error: error.message,
    });
  }
};

exports.RevertDeleteCategoriesAdminByIsDelete = async (req, res) => {
  try {
    const { id } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Cập nhật trạng thái is_deleted thành false để khôi phục người dùng
    await db.query(
      "UPDATE categories SET is_deleted = 'false' WHERE id_categories = ?",
      [id]
    );

    res.status(200).json({
      message: "Khôi phục danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi khôi phục danh mục",
      error: error.message,
    });
  }
};

exports.DeleteCategoriesAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Xóa người dùng khỏi cơ sở dữ liệu
    await db.query("DELETE FROM categories WHERE id_categories = ?", [id]);

    res.status(200).json({
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa danh mục",
      error: error.message,
    });
  }
};

exports.UpdateCategoriesAdmin = async (req, res) => {
  try {
    const { id, name, image_categories } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id || !name) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    const slug = name
      .toLowerCase()
      .normalize("NFD") // Bỏ dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ ký tự dấu
      .replace(/[^a-z0-9 ]/g, "") // Loại bỏ ký tự đặc biệt
      .trim() // Bỏ khoảng trắng đầu/cuối
      .replace(/\s+/g, "-"); // Thay khoảng trắng bằng dấu gạch ngang
    // Cập nhật thông tin người dùng
    await db.query(
      "UPDATE categories SET name= ? , image_categories = ?, slug = ?   WHERE id_categories = ?",
      [name, image_categories | null, slug, id]
    );
    const [resultCategoryRows] = await db.query(
      "SELECT * FROM categories WHERE id_categories = ?",
      [id]
    );
    res.status(200).json({
      message: "Cập nhật thông tin danh mục thành công",
      data: resultCategoryRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin danh mục",
      error: error.message,
    });
  }
};
