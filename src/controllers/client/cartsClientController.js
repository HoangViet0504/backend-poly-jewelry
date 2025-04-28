const db = require("../../config/connectDB");

exports.getListCartByUser = async (req, res) => {
  try {
    const { id } = req.query;
    const [cartRows] = await db.query(
      `
      SELECT 
        carts.id AS id_cart,
        carts.id_user,
        carts.id_product,
        carts.quantity,
        carts.total,
        carts.made,
        carts.size,
        products.name_product,
        products.price,
        products.slug,
        products.price_sale,
        products.primary_image
      FROM 
        carts
      INNER JOIN 
        products ON carts.id_product = products.id
      WHERE 
        carts.id_user = ?
      `,
      [id]
    );

    const data = cartRows.map((item) => ({
      id_cart: item.id_cart,
      id_user: item.id_user,
      id_product: item.id_product,
      quantity: item.quantity,
      total: item.total,
      made: item.made,
      size: item.size,
      name_product: item.name_product,
      slug: item.slug,
      price: item.price,
      price_sale: item.price_sale,
      image_product: item.primary_image,
    }));

    res.json({
      message: "Lấy đơn hàng thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách giỏ hàng",
      error: error.message,
    });
  }
};

exports.updateQuantityCart = async (req, res) => {
  try {
    const { id_cart, type } = req.body; // type: 'increase' | 'decrease'

    // Lấy thông tin giỏ hàng hiện tại
    const [rows] = await db.query(
      `SELECT carts.*, products.price, products.price_sale 
       FROM carts 
       INNER JOIN products ON carts.id_product = products.id 
       WHERE carts.id = ?`,
      [id_cart]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    const cart = rows[0];
    const price = cart.price_sale > 0 ? cart.price_sale : cart.price;
    let newQuantity = cart.quantity;

    if (type === "increase") {
      newQuantity += 1;
    } else if (type === "decrease") {
      newQuantity -= 1;
    } else {
      return res.status(400).json({ message: "Loại cập nhật không hợp lệ" });
    }

    if (newQuantity <= 0) {
      await db.query(`DELETE FROM carts WHERE id = ?`, [id_cart]);
      return res.json({ message: "Đã xóa sản phẩm khỏi giỏ hàng" });
    }

    const newTotal = newQuantity * price;

    await db.query(
      `UPDATE carts SET quantity = ?, total = ?, updated_at = NOW() WHERE id = ?`,
      [newQuantity, newTotal, id_cart]
    );

    const [updated] = await db.query(`SELECT * FROM carts WHERE id = ?`, [
      id_cart,
    ]);

    res.json({
      message: "Cập nhật số lượng thành công",
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi cập nhật số lượng sản phẩm",
      error: error.message,
    });
  }
};

exports.addProductToCart = async (req, res) => {
  try {
    const { id_product, id_user, quantity, size, made } = req.body;

    const [productRows] = await db.query(
      `SELECT price, price_sale FROM products WHERE id = ?`,
      [id_product]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const product = productRows[0];
    const price = product.price_sale > 0 ? product.price_sale : product.price;
    const total = quantity * price;

    const [existingItems] = await db.query(
      `
      SELECT * FROM carts
      WHERE id_user = ? AND id_product = ? AND size = ? AND made = ?
      `,
      [id_user, id_product, size, made]
    );

    let message = "";
    let result = [];

    if (existingItems.length === 0) {
      const [addCart] = await db.query(
        `INSERT INTO carts (id_user, id_product, quantity, size, made, total, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id_user, id_product, quantity, size, made, total]
      );

      [result] = await db.query(`SELECT * FROM carts WHERE id = ?`, [
        addCart.insertId,
      ]);
      message = "Thêm sản phẩm vào giỏ hàng thành công";
    } else {
      const existing = existingItems[0];
      const newQuantity = existing.quantity + quantity;
      const newTotal = newQuantity * price;

      await db.query(
        `UPDATE carts SET quantity = ?, total = ?, updated_at = NOW() WHERE id = ?`,
        [newQuantity, newTotal, existing.id]
      );

      [result] = await db.query(`SELECT * FROM carts WHERE id = ?`, [
        existing.id,
      ]);
      message = "Cập nhật số lượng sản phẩm thành công";
    }

    res.json({ message, data: result });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi thêm sản phẩm vào giỏ hàng",
      error: error.message,
    });
  }
};

exports.deleteCartById = async (req, res) => {
  try {
    const { id, id_user } = req.body;

    // Kiểm tra xem sản phẩm có trong giỏ hàng không
    const [existingItem] = await db.query(
      `SELECT * FROM carts WHERE id = ? AND id_user = ?`,
      [id, id_user]
    );

    if (existingItem.length === 0) {
      return res.status(404).json({
        message: "Sản phẩm không tồn tại trong giỏ hàng",
      });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    await db.query(`DELETE FROM carts WHERE id = ?`, [id]);

    // Truy vấn lại danh sách giỏ hàng sau khi xóa
    const [result] = await db.query(`SELECT * FROM carts WHERE id_user = ?`, [
      id_user,
    ]);

    res.json({
      message: "Xóa sản phẩm thành công",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm",
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

exports.getProductDetailInCart = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const { id } = req.query;
    const [result] = await db.query(
      `
          SELECT 
              *
            FROM
              products
             WHERE id = ?
                `,
      [id]
    );
    res.json({
      message: "Lấy sản phẩm trong giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy sản phẩm trong giỏ hàng ",
      error: error.message,
    });
  }
};

exports.getVoucherByCode = async (req, res) => {
  try {
    const { code } = req.body;
    const [result] = await db.query(
      `
      SELECT * FROM vouchers 
      WHERE code_coupon = ?
      AND start_date <= NOW()
      AND expires_at >= NOW()
      AND quantity > 0           AND status = 'active'
  `,
      [code]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message:
          "Mã giảm giá không tồn tại, đã hết hạn hoặc đã được sử dụng hết.",
      });
    }

    res.json({
      message: "Áp dụng mã giảm giá thành công.",
      data: result[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Đã xảy ra lỗi khi kiểm tra mã giảm giá.",
      error: error.message,
    });
  }
};

exports.mergeCart = async (req, res) => {
  try {
    const { id_user, id_product, quantity, total, made, size } = req.body;

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const [existing] = await db.query(
      `SELECT * FROM carts WHERE id_user = ? AND id_product = ? AND made = ? AND size = ?`,
      [id_user, id_product, made, size]
    );

    if (existing.length > 0) {
      // Nếu đã có -> cập nhật quantity + total
      const cartItem = existing[0];
      const newQuantity = cartItem.quantity + quantity;
      const newTotal = cartItem.total + total;
      await db.query(`UPDATE carts SET quantity = ?, total = ? WHERE id = ?`, [
        newQuantity,
        newTotal,
        cartItem.id,
      ]);
    } else {
      // Nếu chưa có -> thêm mới
      await db.query(
        `INSERT INTO carts (id_user, id_product, quantity, total, made, size, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id_user, id_product, quantity, total, made, size]
      );
    }

    // Lấy lại toàn bộ giỏ hàng sau khi merge
    const [result] = await db.query(`SELECT * FROM carts WHERE id_user = ?`, [
      id_user,
    ]);

    res.json({
      message: "Đã thêm hoặc cập nhật sản phẩm trong giỏ hàng thành công",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi xử lý giỏ hàng",
      error: error.message,
    });
  }
};
