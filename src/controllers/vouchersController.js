const db = require("../config/connectDb");

exports.getListVouchersAdmin = async (req, res) => {
  try {
    const {
      keyWord = "",
      status,
      type_coupon,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    let conditions = [];
    let values = [];

    // Filter theo keyWord
    if (keyWord) {
      conditions.push(`(code_coupon  LIKE ? OR description LIKE ?)`);
      values.push(`%${keyWord}%`, `%${keyWord}%`);
    }

    // Filter theo status
    if (status) {
      conditions.push(`status = ?`);
      values.push(status);
    }

    // Filter theo type_coupon
    if (type_coupon) {
      conditions.push(`type_coupon = ?`);
      values.push(type_coupon);
    }

    // Tạo chuỗi where
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Query tổng số lượng để tính meta
    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM vouchers
      ${whereClause}
    `,
      values
    );
    const total = countRows[0].total;

    // Query dữ liệu vouchers có phân trang
    const [vouchersRows] = await db.query(
      `
      SELECT *
      FROM vouchers
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...values, limitNumber, offset]
    );

    res.json({
      message: "Lấy danh sách khuyến mãi thành công",
      data: vouchersRows,
      meta: {
        totalItems: total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        perPage: limitNumber,
        showing: `Hiển thị từ ${offset + 1} đến ${
          offset + vouchersRows.length
        } của ${total} bản ghi`,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách khuyến mãi",
      error: error.message,
    });
  }
};

exports.getListVouchersAdminByKeyWord = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    let vouchersRows;

    if (keyword === "") {
      // Nếu không có keyword, lấy tất cả người dùng (không bị xóa)
      [vouchersRows] = await db.query(`
     SELECT  * FROM vouchers ;
      `);
    } else {
      // Nếu có keyword, lọc theo tên, email hoặc số điện thoại
      [vouchersRows] = await db.query(
        `
      SELECT 
        * FROM vouchers 
          WHERE (
            code_coupon LIKE ? 
          )
        `,
        [`%${keyword}%`]
      );
    }

    res.json({
      message: "Lấy khuyến mãi thành công",
      data: vouchersRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy khuyến mãi ",
      error: error.message,
    });
  }
};

exports.getVouchersAdmin = async (req, res) => {
  try {
    const { id } = req.query;
    // Truy vấn thông tin người dùng và địa chỉ
    const [vouchersRows] = await db.query(
      `
      SELECT 
      * FROM vouchers 
      WHERE  id = ?;
    `,
      [id]
    );

    res.json({
      message: "Lấy thông tin khuyến mãi thành công",
      data: vouchersRows[0] ?? {},
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin khuyến mãi",
      error: error.message,
    });
  }
};

// exports.AddVouchersAdmin = async (req, res) => {
//   try {
//     const {
//       code_coupon,
//       description,
//       start_date,
//       expires_at,
//       coupon_min_spend,
//       coupon_max_spend,
//       discount,
//       type_coupon,
//       quantity,
//       status,
//     } = req.body;

//     // Kiểm tra thông tin bắt buộc
//     if (
//       !code_coupon ||
//       !start_date ||
//       !expires_at ||
//       !coupon_min_spend ||
//       !coupon_max_spend ||
//       !discount ||
//       !type_coupon
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Vui lòng nhập đầy đủ thông tin" });
//     }

//     // Kiểm tra email đã tồn tại chưa
//     const [existingVouchers] = await db.query(
//       "SELECT * FROM vouchers WHERE code_coupon = ?",
//       [code_coupon]
//     );

//     if (existingVouchers.length > 0) {
//       return res.status(409).json({ message: "Tên khuyến mãi đã tồn tại" });
//     }

//     const [result] = await db.query(
//       "INSERT INTO vouchers (code_coupon,description,start_date,expires_at,coupon_min_spend,coupon_max_spend,discount,type_coupon,status,quantity,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,NOW())",
//       [
//         code_coupon,
//         description,
//         start_date,
//         expires_at,
//         coupon_min_spend,
//         coupon_max_spend,
//         discount,
//         type_coupon,
//         status,
//         quantity,
//       ]
//     );

//     const [newVouchersRows] = await db.query(
//       "SELECT * FROM vouchers WHERE id = ?",
//       [result.insertId]
//     );
//     res.status(201).json({
//       message: "Thêm khuyến mãi thành công",
//       data: newVouchersRows[0],
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi thêm khuyến mãi",
//       error: error.message,
//     });
//   }
// };

exports.AddVouchersAdmin = async (req, res) => {
  try {
    const {
      code_coupon,
      description,
      start_date,
      expires_at,
      coupon_min_spend,
      coupon_max_spend,
      discount,
      type_coupon,
      quantity,
      status,
    } = req.body;

    // Validate thông tin bắt buộc
    if (
      !code_coupon ||
      !start_date ||
      !expires_at ||
      !coupon_min_spend ||
      !coupon_max_spend ||
      !discount ||
      !type_coupon
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra code_coupon đã tồn tại chưa
    const [existingVouchers] = await db.query(
      "SELECT * FROM vouchers WHERE code_coupon = ?",
      [code_coupon]
    );

    if (existingVouchers.length > 0) {
      return res.status(409).json({ message: "Tên khuyến mãi đã tồn tại" });
    }

    // Thêm voucher mới
    const [result] = await db.query(
      "INSERT INTO vouchers (code_coupon, description, start_date, expires_at, coupon_min_spend, coupon_max_spend, discount, type_coupon, status, quantity, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        code_coupon,
        description,
        start_date,
        expires_at,
        coupon_min_spend,
        coupon_max_spend,
        discount,
        type_coupon,
        status,
        quantity,
      ]
    );

    // Lấy voucher vừa thêm
    const [newVouchersRows] = await db.query(
      "SELECT * FROM vouchers WHERE id = ?",
      [result.insertId]
    );

    // Lấy tổng số voucher
    const [totalVouchers] = await db.query(
      "SELECT COUNT(*) as total FROM vouchers"
    );
    const total = totalVouchers[0]?.total || 0;

    // Setup pagination thông số
    const limitNumber = 10; // Giả sử mặc định là 10 bản ghi mỗi trang (bạn có thể thay đổi)
    const pageNumber = Math.ceil(total / limitNumber); // Đẩy về trang cuối
    const offset = (pageNumber - 1) * limitNumber;

    res.status(201).json({
      message: "Thêm khuyến mãi thành công",
      data: newVouchersRows[0],
      meta: {
        totalItems: total,
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        perPage: limitNumber,
        showing: `Hiển thị từ ${offset + 1} đến ${
          offset + newVouchersRows.length
        } của ${total} bản ghi`,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm khuyến mãi",
      error: error.message,
    });
  }
};

exports.DeleteVouchersAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id) {
      return res.status(400).json({ message: "Vui lòng nhập id" });
    }

    // Xóa người dùng khỏi cơ sở dữ liệu
    await db.query("DELETE FROM vouchers WHERE id = ?", [id]);

    res.status(200).json({
      message: "Xóa khuyến mãi thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa khuyến mãi",
      error: error.message,
    });
  }
};

exports.UpdateVouchersAdmin = async (req, res) => {
  try {
    const {
      id,
      code_coupon,
      description,
      start_date,
      expires_at,
      coupon_min_spend,
      coupon_max_spend,
      discount,
      type_coupon,
      quantity,
      status,
    } = req.body;

    // Kiểm tra thông tin bắt buộc

    await db.query(
      "UPDATE vouchers SET code_coupon= ? , description = ?,start_date=?, expires_at = ?,coupon_min_spend=?, coupon_max_spend=?,discount=?, type_coupon=?,quantity=?, status=? WHERE id = ?",
      [
        code_coupon,
        description,
        start_date,
        expires_at,
        coupon_min_spend,
        coupon_max_spend,
        discount,
        type_coupon,
        quantity,
        status,
        id,
      ]
    );
    const [resultCategoryRows] = await db.query(
      "SELECT * FROM vouchers WHERE id = ?",
      [id]
    );

    res.status(200).json({
      message: "Cập nhật thông tin khuyến mãi thành công",
      data: resultCategoryRows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin khuyến mãi",
      error: error.message,
    });
  }
};
