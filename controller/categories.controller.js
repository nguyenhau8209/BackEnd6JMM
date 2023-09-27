const Category = require("../models/categories.model");
const messageModal = require("../models/message.model");
const Total = require("../models/total.model");
const returnRes = require("../utils/config");
exports.getCategories = async (req, res) => {
  const userID = req.query.userID;

  try {
    // Kiểm tra xem có tồn tại userID trong request body không
    if (!userID) {
      return res.status(400).json({ status: 400, message: "Invalid UserID" });
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
exports.getCategoriesByUserID = async (req, res) => {
  const userID = req.query.userID;
  let codeTotal = [];

  try {
    //Kiểm tra xem userID có trùng với userID được truyền lên không
    if (req.data._id !== userID) {
      return res.status(400).json({ status: 400, message: "Unauthorized" });
    }
    // Kiểm tra xem có tồn tại userID trong request query không
    if (!userID) {
      return res.status(400).json({ status: 400, message: "Invalid userID" });
    }

    // Lấy danh sách tất cả các danh mục từ cơ sở dữ liệu
    const categories = await Category.find();

    // Lấy danh sách tin nhắn dựa trên userID và khoảng thời gian
    const findMessageByUserID = await messageModal.message.find({
      userID,
    });

    await Promise.all(
      categories.map(async (category) => {
        const categoryCode = category.code;

        // Lọc tin nhắn chỉ cần những tin nhắn thuộc danh mục hiện tại
        const categoryMessages = findMessageByUserID.filter(
          (message) => message.code === categoryCode
        );

        // Tính tổng giá trị của các tin nhắn trong danh mục hiện tại
        const total = categoryMessages.reduce((accumulator, message) => {
          return accumulator + parseFloat(message.price || 0);
        }, 0);

        codeTotal.push({ ...category.toJSON(), total });
      })
    );

    // Trả về phản hồi thành công với danh sách danh mục đã cập nhật
    return res.status(200).json({
      status: 200,
      data: codeTotal,
      message: "Get categories success",
    });
  } catch (error) {
    // Xử lý lỗi: In lỗi ra console và trả về phản hồi lỗi chi tiết
    console.error(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
exports.getTotalByFillter = async (req, res) => {
  const userID = req.query.userID;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  let codeTotal = [];

  try {
    //Kiểm tra xem userID có trùng với userID được truyền lên không
    if (req.data._id !== userID) {
      return returnRes(res, 401, "Unauthorized");
    }

    // Kiểm tra xem có tồn tại userID trong request query không
    if (!userID) {
      return res.status(400).json({ status: 400, message: "Invalid userID" });
    }
    // Kiểm tra xem startDate và endDate có đúng định dạng ngày không
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid date format" });
    }

    // Lấy danh sách tất cả các danh mục từ cơ sở dữ liệu
    const categories = await Category.find();

    // Lấy danh sách tin nhắn dựa trên userID và khoảng thời gian
    const findMessageByDate = await messageModal.message.find({
      userID,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    await Promise.all(
      categories.map(async (category) => {
        const categoryCode = category.code;

        // Lọc tin nhắn chỉ cần những tin nhắn thuộc danh mục hiện tại
        const categoryMessages = findMessageByDate.filter(
          (message) => message.code === categoryCode
        );

        // Tính tổng giá trị của các tin nhắn trong danh mục hiện tại
        const total = categoryMessages.reduce((accumulator, message) => {
          return accumulator + parseFloat(message.price || 0);
        }, 0);

        codeTotal.push({ ...category.toJSON(), total });
      })
    );

    // Trả về phản hồi thành công với danh sách danh mục đã cập nhật
    return res.status(200).json({
      status: 200,
      data: codeTotal,
      message: "Get categories success",
    });
  } catch (error) {
    // Xử lý lỗi: In lỗi ra console và trả về phản hồi lỗi chi tiết
    console.error(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

// Kiểm tra xem định dạng ngày có hợp lệ không
function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return dateRegex.test(dateString);
}
