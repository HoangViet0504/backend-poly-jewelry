const db = require("../../config/connectDB");

exports.getListCartByUser = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const { id } = req.query;
    const [categoriesRows] = await db.query(
      `
            SELECT 
        * 
      FROM 
        carts
        INNER JOIN products ON carts.id_product = products.id
       WHERE carts.id_user = ?
          `,
      [id]
    );
    res.json({
      message: "Lấy đơn hàng thành công",
      data: categoriesRows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh mục",
      error: error.message,
    });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const { id_cart, id_product, id_user, quantity, price } = req.body;
    const [checkCart] = await db.query(
      `
    SELECT 
        * 
      FROM 
        carts
       WHERE  id_product = ?
          `,
      [id_product]
    );
    if (checkCart.length === 0) {
      const [addCart] = await db.query(
        `INSERT INTO carts (id_user, id_product, quantity, price, created_at ) VALUES (?,?,?,?,NOW()) `,
        [id_user, id_product, quantity, price]
      );
      const [result] = await db.query(`SELECT * FROM carts WHERE id = ?`, [
        addCart.insertId,
      ]);
      res.json({
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        data: result,
      });
    } else {
      await db.query(`UPDATE carts SET quantity =?, price=? WHERE id = ?`, [
        quantity,
        price,
        id_cart,
      ]);
      const [resultCart] = await db.query(`SELECT * FROM carts WHERE id = ?`, [
        id_cart,
      ]);
      res.json({
        message: "Tăng số lượng sản phẩm thành công",
        data: resultCart,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thêm sản phẩm ",
      error: error.message,
    });
  }
};

exports.deleteCartById = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const { id, id_user } = req.body;
    await db.query(`DELETE FROM carts WHERE id = ?`, [id]);
    const [result] = await db.query(
      `
          SELECT 
              *
            FROM
              carts
             WHERE id_user = ?
                `,
      [id_user]
    );
    res.json({
      message: "Xóa sản phẩm thành công",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm ",
      error: error.message,
    });
  }
};

exports.deleteAllCart = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const { id } = req.body;
    await db.query(`DELETE FROM carts WHERE id_user = ?`, [id]);
    res.json({
      message: "Xóa tất cả đơn hàng thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa đơn hàng ",
      error: error.message,
    });
  }
};

// exports.mergeCart = async (req, res) => {
//   try {
//     // Truy vấn thông tin người dùng từ database
//     const { id_user, id_product, quantity, price } = req.body;
//     await db.query(
//       `INSERT INTO carts (id_user, id_product, quantity, price, created_at ) VALUES (?,?,?,?,NOW()) `,
//       [id_user, id_product, quantity, price]
//     );
//     const [result] = await db.query(`SELECT * FROM carts WHERE id_user = ? `, [
//       id_user,
//     ]);
//     res.json({
//       message: "Thêm sản phẩm vào giỏ hàng thành công",
//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi lấy thêm sản phẩm ",
//       error: error.message,
//     });
//   }
// };
