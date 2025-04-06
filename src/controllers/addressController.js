const db = require("../config/connectDb");

exports.getAllProvince = async (req, res) => {
  try {
    // Truy vấn thông tin người dùng từ database
    const [province] = await db.query(`
      SELECT * FROM province;
    `);
    res.json({
      data: province,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thành phố",
      error: error.message,
    });
  }
};

exports.getAllDistrictById = async (req, res) => {
  try {
    const { id } = req.query;
    const [districts] = await db.query(
      `SELECT * FROM district WHERE _province_id = ?`,
      [id]
    );

    if (districts.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy quận/huyện cho tỉnh này",
      });
    }

    res.json({
      data: districts,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin quận/huyện",
      error: error.message,
    });
  }
};

exports.getAllWardById = async (req, res) => {
  try {
    const { id } = req.query;
    const [wards] = await db.query(
      `SELECT * FROM ward WHERE _district_id = ? `,
      [id]
    );

    if (wards.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy xã / phường cho tỉnh này",
      });
    }

    res.json({
      data: wards,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thông tin xã / phường",
      error: error.message,
    });
  }
};
