const db = require("../config/connectDb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// exports.getListUserAdmin = async (req, res) => {
//   try {
//     const {
//       keyword = "",
//       status = "",
//       role = "",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const offset = (page - 1) * limit;

//     let query = `
//       SELECT
//         u.*,
//         a.province,
//         a.district,
//         a.ward,
//         a.specific_address
//       FROM user u
//       LEFT JOIN address a ON u.id_user = a.id_user
//       WHERE u.is_deleted = 'false'
//     `;

//     const params = [];

//     if (keyword.trim() !== "") {
//       query += `
//         AND (
//           u.first_name LIKE ?
//           OR u.last_name LIKE ?
//           OR u.email LIKE ?
//           OR u.phone LIKE ?
//         )
//       `;
//       params.push(
//         `%${keyword}%`,
//         `%${keyword}%`,
//         `%${keyword}%`,
//         `%${keyword}%`
//       );
//     }

//     if (status.trim() !== "") {
//       query += ` AND u.is_active = ? `;
//       params.push(status);
//     }

//     if (role.trim() !== "") {
//       query += ` AND u.role = ? `;
//       params.push(role);
//     }

//     query += ` LIMIT ? OFFSET ? `;
//     params.push(parseInt(limit), parseInt(offset));

//     const [userRows] = await db.query(query, params);

//     // Đếm tổng
//     let countQuery = `
//       SELECT COUNT(*) as total
//       FROM user u
//       LEFT JOIN address a ON u.id_user = a.id_user
//       WHERE u.is_deleted = 'false'
//     `;
//     const countParams = [];

//     if (keyword.trim() !== "") {
//       countQuery += `
//         AND (
//           u.first_name LIKE ?
//           OR u.last_name LIKE ?
//           OR u.email LIKE ?
//           OR u.phone LIKE ?
//         )
//       `;
//       countParams.push(
//         `%${keyword}%`,
//         `%${keyword}%`,
//         `%${keyword}%`,
//         `%${keyword}%`
//       );
//     }

//     if (status.trim() !== "") {
//       countQuery += ` AND u.is_active = ? `;
//       countParams.push(status);
//     }

//     if (role.trim() !== "") {
//       countQuery += ` AND u.role = ? `;
//       countParams.push(role);
//     }

//     const [[{ total }]] = await db.query(countQuery, countParams);

//     res.json({
//       message: "Lấy thông tin thành công",
//       data: userRows,
//       meta: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi lấy thông tin người dùng",
//       error: error.message,
//     });
//   }
// };

// exports.getListUserAdminByKeyWord = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     // Truy vấn thông tin người dùng từ database
//     if (keyword === "") {
//       const [userRows] = await db.query(
//         `
//         SELECT
//           u.*,
//           a.province,
//           a.district,
//           a.ward,
//           a.specific_address
//         FROM user u
//         LEFT JOIN address a ON u.id_user = a.id_user
//         WHERE u.is_deleted = 'false'

//       `
//       );
//     } else {
//       const [userRows] = await db.query(
//         `
//         SELECT
//           u.*,
//           a.province,
//           a.district,
//           a.ward,
//           a.specific_address
//         FROM user u
//         LEFT JOIN address a ON u.id_user = a.id_user
//         WHERE u.is_deleted = 'false'
//           AND (
//             u.first_name LIKE ?
//             OR u.last_name LIKE ?
//             OR u.email LIKE ?
//             OR u.phone LIKE ?
//           )
//       `,
//         [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
//       );
//     }

//     // Trả về thông tin người dùng
//     res.json({
//       message: "Lấy thông tin thành công",
//       data: userRows,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi lấy thông tin người dùng",
//       error: error.message,
//     });
//   }
// };
exports.getListUserAdmin = async (req, res) => {
  try {
    const {
      keyword = "",
      status = "",
      role = "",
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.*, 
        a.province, 
        a.district, 
        a.ward, 
        a.specific_address
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.is_deleted = 'false'
    `;

    const params = [];

    if (keyword.trim() !== "") {
      query += `
        AND (
          u.first_name LIKE ? 
          OR u.last_name LIKE ? 
          OR u.email LIKE ? 
          OR u.phone LIKE ?
        )
      `;
      params.push(
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`
      );
    }

    if (status.trim() !== "") {
      query += ` AND u.is_active = ? `;
      params.push(status);
    }

    if (role.trim() !== "") {
      query += ` AND u.role = ? `;
      params.push(role);
    }

    query += ` LIMIT ? OFFSET ? `;
    params.push(parseInt(limit), parseInt(offset));

    const [userRows] = await db.query(query, params);

    // Đếm tổng
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.is_deleted = 'false'
    `;
    const countParams = [];

    if (keyword.trim() !== "") {
      countQuery += `
        AND (
          u.first_name LIKE ? 
          OR u.last_name LIKE ? 
          OR u.email LIKE ? 
          OR u.phone LIKE ?
        )
      `;
      countParams.push(
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`,
        `%${keyword}%`
      );
    }

    if (status.trim() !== "") {
      countQuery += ` AND u.is_active = ? `;
      countParams.push(status);
    }

    if (role.trim() !== "") {
      countQuery += ` AND u.role = ? `;
      countParams.push(role);
    }

    const [[{ total }]] = await db.query(countQuery, countParams);

    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const totalPages = Math.ceil(total / perPage);
    const start = total === 0 ? 0 : offset + 1;
    const end = offset + userRows.length;
    const showing =
      total === 0
        ? "Hiển thị 0 kết quả"
        : `Hiển thị ${start} đến ${end} trong tổng ${total} kết quả`;

    res.json({
      message: "Lấy thông tin thành công",
      data: userRows,
      meta: {
        totalItems: total,
        currentPage,
        totalPages,
        perPage,
        showing,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

exports.getListUserAdminByKeyWord = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    let userRows;

    if (keyword.trim() === "") {
      // Nếu không có keyword, lấy tất cả người dùng (không bị xóa)
      [userRows] = await db.query(`
        SELECT 
          u.*, 
          a.province, 
          a.district, 
          a.ward, 
          a.specific_address
        FROM user u
        LEFT JOIN address a ON u.id_user = a.id_user 
        WHERE u.is_deleted = 'false'
      `);
    } else {
      // Nếu có keyword, lọc theo tên, email hoặc số điện thoại
      [userRows] = await db.query(
        `
        SELECT 
          u.*, 
          a.province, 
          a.district, 
          a.ward, 
          a.specific_address
        FROM user u
        LEFT JOIN address a ON u.id_user = a.id_user 
        WHERE u.is_deleted = 'false' 
          AND (
            u.first_name LIKE ? 
            OR u.last_name LIKE ? 
            OR u.email LIKE ? 
            OR u.phone LIKE ?
          )
        `,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
    }

    res.json({
      message: "Lấy thông tin thành công",
      data: userRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

exports.getListUserRemoveAdmin = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [userRows] = await db.query(`
      SELECT 
  u.*, 
  a.province, 
  a.district, 
  a.ward, 
  a.specific_address
FROM user u
LEFT JOIN address a ON u.id_user = a.id_user WHERE u.is_deleted = 'true';
    `);

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Danh sách khách hàng không tồn tại" });
    }

    // Trả về thông tin người dùng
    res.json({
      message: "Lấy thông tin thành công",
      data: userRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

exports.getUserAdmin = async (req, res) => {
  try {
    const { id } = req.query;

    // Truy vấn thông tin người dùng và địa chỉ
    const [userRows] = await db.query(
      `
      SELECT 
        u.*, 
        a.province, 
        a.district, 
        a.ward, 
        a.specific_address
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.is_deleted = 'false' AND u.id_user = ?;
    `,
      [id]
    );

    if (!userRows || userRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Thông tin khách hàng không tồn tại" });
    }

    const user = userRows[0];

    // // Truy ngược lại ID từ tên tỉnh/thành, quận/huyện, phường/xã
    const [[provinceRow]] = await db.query(
      `SELECT id FROM province WHERE _name = ? LIMIT 1`,
      [user.province]
    );

    const [[districtRow]] = await db.query(
      `SELECT id FROM district WHERE _name = ? LIMIT 1`,
      [userRows[0].district]
    );

    const [[wardRow]] = await db.query(
      `SELECT id FROM ward WHERE _name = ? LIMIT 1`,
      [user.ward]
    );

    // Trả về thông tin người dùng kèm theo ID tỉnh, huyện, xã
    res.json({
      message: "Lấy thông tin thành công",
      data: {
        ...user,
        province_id: provinceRow?.id || null,
        district_id: districtRow?.id || null,
        ward_id: wardRow?.id || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

exports.AddUserAdmin = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      avatar_img,
      province,
      district,
      ward,
      specific_address,
      birthdate,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !phone ||
      !province ||
      !district ||
      !ward ||
      !specific_address ||
      !birthdate
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại chưa
    const [existingUser] = await db.query(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    const [existingPhone] = await db.query(
      "SELECT * FROM user WHERE phone = ?",
      [phone]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email đã được sử dụng" });
    }
    if (existingPhone.length > 0) {
      return res.status(409).json({ message: "Số điện thoại đã được sử dụng" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm người dùng vào database
    const [result] = await db.query(
      "INSERT INTO user (first_name, last_name, email, password, phone, avatar_img,birthdate) VALUES (?, ?, ?, ?, ?, ?,?)",
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        phone,
        avatar_img || null,
        birthdate,
      ]
    );

    const userId = result.insertId;
    // Thêm địa chỉ vào database
    await db.query(
      "INSERT INTO address (province, district, ward, specific_address,id_user) VALUES (?, ?, ?, ?, ?)",
      [province, district, ward, specific_address, userId]
    );
    // Tạo JWT token
    const token = jwt.sign(
      { id: userId, email, role: 2 },
      process.env.SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );
    await db.query("UPDATE user SET access_token = ? WHERE id_user = ?", [
      token,
      userId,
    ]);

    // Lấy user mới vừa thêm (nếu cần)
    const [newUser] = await db.query(
      `SELECT 
        u.*, 
        a.province, 
        a.district, 
        a.ward, 
        a.specific_address
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.id_user = ?`,
      [result.insertId] // Thay `result.insertId` bằng id bạn muốn tìm
    );

    res.status(201).json({
      message: "Thêm người dùng thành công",
      data: newUser[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm người dùng",
      error: error.message,
    });
  }
};

exports.DeleteUserAdminByIsDelete = async (req, res) => {
  try {
    const { id_user } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id_user) {
      return res.status(400).json({ message: "Vui lòng nhập id_user" });
    }

    // Cập nhật trạng thái is_deleted thành true để thực hiện xóa mềm
    const [result] = await db.query(
      "UPDATE user SET is_deleted = 'true' WHERE id_user = ?",
      [id_user]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json({
      message: "Xóa người dùng thành công ",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
};

exports.RevertDeleteUserAdminByIsDelete = async (req, res) => {
  try {
    const { id_user } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id_user) {
      return res.status(400).json({ message: "Vui lòng nhập id_user" });
    }

    // Cập nhật trạng thái is_deleted thành false để khôi phục người dùng
    const [result] = await db.query(
      "UPDATE user SET is_deleted = 'false' WHERE id_user = ?",
      [id_user]
    );

    res.status(200).json({
      message: "Khôi phục người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi khôi phục người dùng",
      error: error.message,
    });
  }
};

exports.DeleteUserAdmin = async (req, res) => {
  try {
    const { id_user } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (!id_user) {
      return res.status(400).json({ message: "Vui lòng nhập id_user" });
    }

    // Xóa người dùng khỏi cơ sở dữ liệu
    const [result] = await db.query("DELETE FROM user WHERE id_user = ?", [
      id_user,
    ]);

    // Kiểm tra nếu không tìm thấy người dùng để xóa
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    res.status(200).json({
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
};

exports.UpdateUserAdmin = async (req, res) => {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      phone,
      avatar_img,
      province,
      ward,
      district,
      is_active,
      role,
      birthdate,
      specific_address,
    } = req.body;

    // Kiểm tra thông tin bắt buộc
    if (
      !id ||
      !first_name ||
      !last_name ||
      !email ||
      !phone ||
      !province ||
      !ward ||
      !district ||
      !specific_address ||
      !birthdate ||
      !is_active ||
      !role
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra xem người dùng có tồn tại không
    const [existingUser] = await db.query(
      "SELECT * FROM user WHERE id_user = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Cập nhật thông tin người dùng
    const [result] = await db.query(
      "UPDATE user SET first_name = ?, last_name = ?, email = ?, phone = ?, avatar_img = ?, role=?, is_active=?,birthdate=? WHERE id_user = ?",
      [
        first_name,
        last_name,
        email,
        phone,
        avatar_img || null,
        role,
        is_active,
        birthdate,
        id,
      ]
    );
    // Kiểm tra địa chỉ tồn tại chưa
    const [[checkAddress]] = await db.query(
      "SELECT id_address FROM address WHERE id_user = ?",
      [id]
    );

    let result_address;

    if (checkAddress) {
      // Nếu có rồi thì update
      [result_address] = await db.query(
        `UPDATE address 
     SET province = ?, ward = ?, district = ?, specific_address = ? 
     WHERE id_user = ?`,
        [province, ward, district, specific_address, id]
      );
    } else {
      // Nếu chưa có thì insert mới
      [result_address] = await db.query(
        `INSERT INTO address (province, ward, district, specific_address, id_user)
     VALUES (?, ?, ?, ?, ?)`,
        [province, ward, district, specific_address, id]
      );
    }

    // Kiểm tra kết quả
    if (result.affectedRows === 0 || result_address.affectedRows === 0) {
      return res.status(404).json({
        message: "Cập nhật thông tin người dùng thất bại",
      });
    }

    // Trả về thông tin người dùng đã cập nhật
    const [updatedUser] = await db.query(
      `SELECT 
        u.*, 
        a.province, 
        a.district, 
        a.ward, 
        a.specific_address
      FROM user u
      LEFT JOIN address a ON u.id_user = a.id_user 
      WHERE u.id_user = ?`,
      [id]
    );

    res.status(200).json({
      message: "Cập nhật thông tin người dùng thành công",
      data: updatedUser[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật thông tin người dùng",
      error: error.message,
    });
  }
};
