// Import các modules và models cần thiết
const Category = require("../models/categories.model");
const messageModal = require("../models/message.model");

// Hàm xử lý HTTP GET request để lấy danh sách các danh mục và tính tổng giá trị của các tin nhắn trong mỗi danh mục.
exports.getCategories = async (req, res) => {
  try {
    // Lấy danh sách các danh mục từ cơ sở dữ liệu
    const categories = await Category.find();

    // Tạo một mảng chứa mã danh mục của từng danh mục
    const codeCategory = categories.map((value) => value.code);
    // Lặp qua danh sách mã danh mục để tính tổng giá trị của tin nhắn trong mỗi danh mục
    for (let v of codeCategory) {
      // Tìm các tin nhắn có mã danh mục tương ứng
      const messageFindByCode = await messageModal.message.find({ code: v });

      // Tính tổng giá trị của các tin nhắn
      const sum = messageFindByCode.reduce((accumulator, currentValue) => {
        // parseFloat() chuyển đổi giá trị price thành số, nếu không thể chuyển đổi thì sẽ trả về 0
        return accumulator + parseFloat(currentValue?.price || 0);
      }, 0);

      // Tìm danh mục có mã tương ứng để cập nhật tổng giá trị
      const categoryUpdate = await Category.findOne({ code: v });

      // Nếu danh mục tồn tại, cập nhật trường total và lưu vào cơ sở dữ liệu
      if (categoryUpdate) {
        categoryUpdate.total = sum;
        await categoryUpdate.save();
      } else {
        // Nếu không tìm thấy danh mục, in ra màn hình một thông báo lỗi
        console.log("error: not found");
      }
    }

    // Trả về một phản hồi JSON với danh sách danh mục đã lấy và thông báo thành công
    return res.status(200).json({
      status: 200,
      data: categories,
      message: "Get categories success",
    });
  } catch (error) {
    // Xử lý lỗi: in lỗi ra màn hình và trả về một phản hồi lỗi
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
