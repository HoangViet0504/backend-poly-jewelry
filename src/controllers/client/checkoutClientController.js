// const axios = require("axios");
// const crypto = require("crypto");

// const config = {
//   app_id: 2553, // ZaloPay Sandbox app_id v2
//   key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
//   endpoint: "https://sb-openapi.zalopay.vn/v2/create",
//   callback_url: "https://yourdomain.com/zalopay-callback",
// };

// exports.checkOut = async (req, res) => {
//   try {
//     const { amount = 10000, userId = "12345" } = req.body;

//     const embed_data = {
//       preferred_payment_method: ["ATM"], // hoặc ["zalopayapp"]
//     };

//     const items = []; // Mảng trống hoặc chi tiết sp nếu cần

//     const now = Date.now();
//     const date = new Date(now);
//     const app_trans_id = `${date.getFullYear().toString().slice(2)}${(
//       date.getMonth() + 1
//     )
//       .toString()
//       .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${now}`; // Format yymmdd_xxxxxx

//     const data = {
//       app_id: config.app_id,
//       app_user: `user_${userId}`,
//       app_time: now,
//       amount: amount,
//       app_trans_id: app_trans_id,
//       embed_data: JSON.stringify(embed_data),
//       item: JSON.stringify(items),
//       callback_url: config.callback_url,
//       description: `Thanh toán đơn hàng #${app_trans_id}`,
//       bank_code: "", // có thể để rỗng nếu không cần
//     };

//     const dataString = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`;
//     data.mac = crypto
//       .createHmac("sha256", config.key1)
//       .update(dataString)
//       .digest("hex");

//     const response = await axios.post(config.endpoint, data, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     });

//     res.json({
//       message: "Tạo đơn hàng thành công",
//       data: response.data,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Lỗi khi tạo đơn hàng",
//       error: error.response?.data || error.message,
//     });
//   }
// };

// exports.zaloPayCallback = async (req, res) => {
//   try {
//     const { data, mac } = req.body;

//     const key2 = "eG4r0GcoNtRGbO8"; // <-- key2 sandbox bạn vừa cung cấp

//     const macCalc = crypto
//       .createHmac("sha256", key2)
//       .update(data)
//       .digest("hex");

//     if (mac !== macCalc) {
//       console.log("❌ Sai chữ ký callback");
//       return res
//         .status(400)
//         .json({ return_code: -1, return_message: "Invalid MAC" });
//     }

//     const resultData = JSON.parse(data);

//     const { app_trans_id, status, zp_trans_id, server_time, user_id, amount } =
//       resultData;

//     // 👉 Bạn có thể lưu đơn hàng tại đây, ví dụ: status === 1 thì là thành công

//     if (status === 1) {
//       console.log(`✅ Đơn hàng ${app_trans_id} thanh toán thành công`);
//     } else {
//       console.log(`❌ Đơn hàng ${app_trans_id} thất bại`);
//     }

//     return res.json({ return_code: 1, return_message: "Callback received" });
//   } catch (err) {
//     console.error("Lỗi xử lý callback:", err.message);
//     return res
//       .status(500)
//       .json({ return_code: -1, return_message: err.message });
//   }
// };

const axios = require("axios");
const crypto = require("crypto");
const db = require("../../config/connectDb");
const config = {
  app_id: 2553, // ZaloPay Sandbox app_id v2
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL", // Sandbox key1
  key2: "eG4r0GcoNtRGbO8", // Sandbox key2
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  callback_url: "http://localhost:3000/zaloPayCallback",
};

// API tạo đơn hàng ZaloPay
exports.checkOut = async (req, res) => {
  try {
    const { amount, userId } = req.body;

    const embed_data = {
      preferred_payment_method: ["ATM"], // hoặc ["zalopayapp"]
      redirecturl: "http://localhost:5173/checkout-success",
    };

    const items = []; // Mảng chi tiết sản phẩm nếu cần

    const now = Date.now();
    const date = new Date(now);
    const app_trans_id = `${date.getFullYear().toString().slice(2)}${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}_${now}`;

    const data = {
      app_id: config.app_id,
      app_user: `user_${userId}`,
      app_time: now,
      amount,
      app_trans_id,
      embed_data: JSON.stringify(embed_data),
      item: JSON.stringify(items),
      callback_url: config.callback_url,
      description: `Thanh toán đơn hàng #${app_trans_id}`,
      bank_code: "",
    };

    const dataString = `${data.app_id}|${data.app_trans_id}|${data.app_user}|${data.amount}|${data.app_time}|${data.embed_data}|${data.item}`;
    data.mac = crypto
      .createHmac("sha256", config.key1)
      .update(dataString)
      .digest("hex");

    const response = await axios.post(config.endpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    res.json({
      message: "Tạo đơn hàng thành công",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: error.response?.data || error.message,
    });
  }
};

// API xử lý callback từ ZaloPay
exports.zaloPayCallback = async (req, res) => {
  try {
    const { data, mac } = req.body;

    const macCalc = crypto
      .createHmac("sha256", config.key2)
      .update(data)
      .digest("hex");

    if (mac !== macCalc) {
      console.log("❌ Sai chữ ký callback");
      return res
        .status(400)
        .json({ return_code: -1, return_message: "Invalid MAC" });
    }

    const resultData = JSON.parse(data);
    const { app_trans_id, status, zp_trans_id, server_time, user_id, amount } =
      resultData;

    if (status === 1) {
      console.log(`✅ Đơn hàng ${app_trans_id} thanh toán thành công`);
    } else {
      console.log(`❌ Đơn hàng ${app_trans_id} thất bại`);
    }

    return res.json({ return_code: 1, return_message: "Callback received" });
  } catch (err) {
    console.error("Lỗi xử lý callback:", err.message);
    return res
      .status(500)
      .json({ return_code: -1, return_message: err.message });
  }
};

// exports.createVNPayUrl = async (req, res) => {
//   try {
//     const { amount = 10000, orderId = Date.now() } = req.body;

//     const date = new Date();
//     const createDate = moment(date).format("YYYYMMDDHHmmss");

//     const ipAddrRaw =
//       req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
//     const ipAddr = ipAddrRaw === "::1" ? "127.0.0.1" : ipAddrRaw;

//     let vnp_Params = {
//       vnp_Version: "2.1.0",
//       vnp_Command: "pay",
//       vnp_TmnCode: vnp_TmnCode,
//       vnp_Locale: "vn",
//       vnp_CurrCode: "VND",
//       vnp_TxnRef: orderId.toString(),
//       vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
//       vnp_OrderType: "other",
//       vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
//       vnp_ReturnUrl: vnp_ReturnUrl,
//       vnp_IpAddr: ipAddr,
//       vnp_CreateDate: createDate,
//     };

//     // Bước 1: Sort keys theo thứ tự alphabet
//     vnp_Params = Object.fromEntries(
//       Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b))
//     );

//     // Bước 2: Tạo chuỗi dữ liệu để ký
//     const signData = qs.stringify(vnp_Params, { encode: false });
//     const secureHash = crypto
//       .createHmac("sha512", vnp_HashSecret)
//       .update(signData)
//       .digest("hex");

//     // Bước 3: Thêm chữ ký vào URL
//     vnp_Params.vnp_SecureHash = secureHash;

//     // Bước 4: Tạo URL thanh toán
//     const vnpUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: true })}`;

//     // Log debug
//     console.log("=== Chuỗi ký:", signData);
//     console.log("=== Secure Hash:", secureHash);
//     console.log("=== Full URL:", vnpUrl);

//     res.json({
//       message: "Tạo URL thanh toán VNPay thành công",
//       url: vnpUrl,
//     });
//   } catch (err) {
//     console.error("Lỗi tạo VNPay URL:", err);
//     res.status(500).json({
//       message: "Lỗi khi tạo URL thanh toán",
//       error: err.message,
//     });
//   }
// };
// const https = require("https");

// exports.createVNPayUrl = async (req, res) => {
//   try {
//     var tmnCode = "OA8L7WZM";
//     var secretKey = "YWHT30XVY0FBDNVHRBDV52V7MEBEO8U7"; // Ensure this is correct and intentional
//     var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
//     var returnUrl = "https://sandbox.vnpayment.vn/return";

//     var date = new Date();

//     var createDate = moment(date).format("YYYYMMDDHHmmss");
//     var orderId = moment(date).format("HHmmss");
//     var amount = req.body.amount;
//     var bankCode = req.body.bankCode;

//     var orderInfo = req.body.orderDescription;
//     var orderType = req.body.orderType;
//     var locale = req.body.language;
//     if (locale === null || locale === "") {
//       locale = "vn";
//     }
//     var currCode = "VND";
//     var vnp_Params = {};
//     vnp_Params["vnp_Version"] = "2.1.0";
//     vnp_Params["vnp_Command"] = "pay";
//     vnp_Params["vnp_TmnCode"] = tmnCode;
//     // vnp_Params['vnp_Merchant'] = ''
//     vnp_Params["vnp_Locale"] = locale;
//     vnp_Params["vnp_CurrCode"] = currCode;
//     vnp_Params["vnp_TxnRef"] = orderId;
//     vnp_Params["vnp_OrderInfo"] = orderInfo;
//     vnp_Params["vnp_OrderType"] = orderType;
//     vnp_Params["vnp_Amount"] = amount * 100;
//     vnp_Params["vnp_ReturnUrl"] = returnUrl;
//     vnp_Params["vnp_IpAddr"] = "127.0.0.1";
//     vnp_Params["vnp_CreateDate"] = createDate;
//     if (bankCode !== null && bankCode !== "") {
//       vnp_Params["vnp_BankCode"] = bankCode;
//     }

//     vnp_Params = Object.fromEntries(
//       Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b))
//     );

//     var querystring = require("qs");
//     var signData = querystring.stringify(vnp_Params, { encode: false });
//     var crypto = require("crypto");
//     var hmac = crypto.createHmac("sha512", secretKey);
//     var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
//     vnp_Params["vnp_SecureHash"] = signed;
//     vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

//     // Trả về URL
//     res.json({ vnpUrl });
//   } catch (err) {
//     console.error("Lỗi tạo VNPay URL:", err);
//     res.status(500).json({
//       message: "Error creating payment URL",
//       error: err.message,
//     });
//   }
// };

// exports.createMoMo = async (req, res) => {
//   const partnerCode = "MOMO";
//   const accessKey = "F8BBA842ECF85";
//   const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

//   const requestId = partnerCode + new Date().getTime();
//   const orderId = requestId;
//   const orderInfo = "pay with MoMo";
//   const redirectUrl = "https://momo.vn/return";
//   const ipnUrl = "https://callback.url/notify";
//   const amount = "50000";
//   const requestType = "captureWallet";
//   const extraData = "";

//   // Tạo chuỗi rawSignature
//   const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

//   // Tạo chữ ký
//   const signature = crypto
//     .createHmac("sha256", secretKey)
//     .update(rawSignature)
//     .digest("hex");

//   const requestBody = JSON.stringify({
//     partnerCode,
//     accessKey,
//     requestId,
//     amount,
//     orderId,
//     orderInfo,
//     redirectUrl,
//     ipnUrl,
//     extraData,
//     requestType,
//     signature,
//     lang: "en",
//   });

//   const options = {
//     hostname: "test-payment.momo.vn",
//     port: 443,
//     path: "/v2/gateway/api/create",
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Content-Length": Buffer.byteLength(requestBody),
//     },
//   };

//   const momoRequest = https.request(options, (momoRes) => {
//     let data = "";

//     momoRes.on("data", (chunk) => {
//       data += chunk;
//     });

//     momoRes.on("end", () => {
//       const result = JSON.parse(data);
//       return res.json(result); // Trả kết quả về frontend
//     });
//   });

//   momoRequest.on("error", (e) => {
//     console.error(`problem with request: ${e.message}`);
//     return res.status(500).json({ error: e.message });
//   });

//   momoRequest.write(requestBody);
//   momoRequest.end();
// };

exports.createOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      note,
      id_user,
      total_amount,
      payment_method,
      discount,
    } = req.body;
    const [response] = await db.query(
      `INSERT INTO orders (name, phone, email, address, note,  id_user, total_amount, payment_method, discount, fee_shipping,created_at) VALUES (?,?,?,?,?,?,?,?,?,0,NOW())`,
      [
        name,
        phone,
        email,
        address,
        note,
        id_user,
        total_amount,
        payment_method,
        discount,
      ]
    );

    return res.json({
      message: "Tạo đơn hàng thành công",
      data: response.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
};

exports.createOrderDetail = async (req, res) => {
  try {
    const {
      id_order,
      id_product,
      quantity,
      price,
      made,
      size,
      id_user,
      name_product,
      primary_image,
      slug,
    } = req.body;
    await db.query(
      `INSERT INTO order_detail (id_order, id_product,primary_image,name_product,slug, quantity, price,made,size,created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())`,
      [
        id_order,
        id_product,
        primary_image,
        name_product,
        slug,
        quantity,
        price,
        made,
        size,
      ]
    );
    await db.query("DELETE FROM carts WHERE id_user = ?", [id_user]);
    await db.query(
      "UPDATE products SET quantity = quantity - ?, sale_quantity = ? WHERE id = ?",
      [quantity, quantity, id_product]
    );
    const [responseOrder] = await db.query(
      "SELECT * FROM orders INNER JOIN order_detail ON orders.id = order_detail.id_order WHERE orders.id = ?",
      [id_order]
    );
    return res.json({
      message: "Tạo đơn hàng thành công",
      data: responseOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi tạo đơn hàng chi tiết",
      error: error.message,
    });
  }
};

exports.getHistoryCart = async (req, res) => {
  try {
    const { id_user } = req.query;
    const [response] = await db.query(
      "SELECT * FROM orders INNER JOIN order_detail ON orders.id = order_detail.id_order  WHERE orders.id_user = ? ORDER BY orders.created_at DESC",
      [id_user]
    );
    return res.json({
      message: "Lấy lịch sử đơn hàng thành công",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi tạo đơn hàng chi tiết",
      error: error.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id_order, id_user } = req.body;
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      "cancel",
      id_order,
    ]);
    const [response] = await db.query(
      "SELECT * FROM orders INNER JOIN order_detail ON orders.id = order_detail.id_order  WHERE orders.id_user = ? ORDER BY orders.created_at DESC",
      [id_user]
    );

    return res.json({
      message: "Hủy đơn hàng thành công",
      data: response,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi hủy đơn hàng",
      error: error.message,
    });
  }
};
