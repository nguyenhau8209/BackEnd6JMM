const Category = require("../models/categories.model");
const messageModal = require("../models/message.model");
const Total = require("../models/total.model");
const returnRes = require("../utils/config");
exports.getCategories = async (req, res) => {
  const userID = req.query.userID;

  try {
    // Kiểm tra xem có tồn tại userID trong request body không
    if (!userID) {
      return returnRes(res, 404, "Invalid userID");
    }
    const categories = await Category.find();
    // Lấy tổng theo từng danh mục từ bảng Total
    const totals = await Total.find({ userID });
    return returnRes(
      res,
      200,
      { categories: categories, totals: totals },
      "Get categories success"
    );
  } catch (error) {
    // Xử lý lỗi: In lỗi ra console và trả về phản hồi lỗi
    console.error(error);
    return returnRes(res, 500, error.message);
  }
};

exports.getCategories2 = async (req, res) => {
  const userID = req.query.userID;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let codeTotal = [];
  try {
    // Kiểm tra xem có tồn tại userID trong request body không
    if (!userID) {
      return res.status(400).json({ status: 400, message: "Invalid userID" });
    }

    // Lấy danh sách tất cả các danh mục từ cơ sở dữ liệu
    const categories = await Category.find();
    const findMessageByDate = await messageModal.message.find({
      userID,
      createdAt: { $gte: startDate, $lte: endDate },
    });
    // Duyệt qua từng danh mục để tính tổng giá trị
    for (const category of categories) {
      const categoryCode = category.code;

      // Lọc tin nhắn chỉ cần những tin nhắn thuộc danh mục hiện tại
      const categoryMessages = findMessageByDate.filter(
        (message) => message.code === categoryCode
      );

      // Tính tổng giá trị của các tin nhắn trong danh mục hiện tại
      const total = categoryMessages.reduce((accumulator, message) => {
        return accumulator + parseFloat(message.price || 0);
      }, 0);
      codeTotal.push({ category: category, total: total });
    }

    // Trả về phản hồi thành công với danh sách danh mục đã cập nhật
    return res.status(200).json({
      status: 200,
      data: codeTotal,
      message: "Get categories success",
    });
  } catch (error) {
    // Xử lý lỗi: In lỗi ra console và trả về phản hồi lỗi
    console.error(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
