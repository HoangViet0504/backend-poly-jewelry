const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tiennbaps30960@fpt.edu.vn",
    pass: "uibq zdpi iauh poks",
  },
});

const sendRegisterEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: "tiennbaps30960@fpt.edu.vn",
      to: email,
      subject: "Cảm ơn bạn đã đăng ký tài khoản!",
      html: `
          <div style="max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
            <h2 style="color:#007bff;">Xin chào ${email},</h2>
            <p style="font-size:16px;">
              Cảm ơn bạn đã tạo tài khoản. Chúng tôi rất vui khi được đồng hành cùng bạn!
            </p>
  
            <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;" />
            <p style="font-size:12px;text-align:center;color:#aaa;">
              © ${new Date().getFullYear()} Hệ thống mua bán trực tuyến.
            </p>
          </div>
        `,
    });
  } catch (err) {
    console.error("Lỗi khi gửi email:", err.message);
  }
};

const sendEmailForgotPassword = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: "tiennbaps30960@fpt.edu.vn",
      to: email,
      subject: "Cảm ơn bạn đã đăng ký tài khoản!",
      html: `
          <div style="max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
            <h2 style="color:#007bff;">Xin chào ${email},</h2>
            <p style="font-size:16px;">
              Mã xác nhận của bạn là: <strong>${otp}</strong>. Vui lòng nhập mã này để xác nhận yêu cầu của bạn.
            </p>
  
            <hr style="margin-top:30px;border:none;border-top:1px solid #ddd;" />
            <p style="font-size:12px;text-align:center;color:#aaa;">
              © ${new Date().getFullYear()} Hệ thống mua bán trực tuyến.
            </p>
          </div>
        `,
    });
  } catch (err) {
    console.error("Lỗi khi gửi email:", err.message);
  }
};

module.exports = { sendRegisterEmail, sendEmailForgotPassword };
