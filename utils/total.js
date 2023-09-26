const Category = require("../models/categories.model");
const Total = require("../models/total.model");

const returnTotal = async (userID, code, price) => {
  // Cập nhật hoặc tạo bản ghi Total tương ứng
  const existingTotal = await Total.findOne({ userID, code });
  if (existingTotal) {
    // Nếu đã tồn tại bản ghi Total, cập nhật tổng
    existingTotal.total += parseFloat(price || 0);
    return await existingTotal.save();
  } else {
    // Nếu chưa tồn tại, tạo mới
    const newTotal = new Total({
      userID,
      code,
      total: parseFloat(price || 0),
    });
    return await newTotal.save();
  }
};

module.exports = returnTotal;
