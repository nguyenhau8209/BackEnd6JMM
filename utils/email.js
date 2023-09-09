const nodemailer = require("nodemailer");

// Hàm gửi email
const sendEmail = async (email, subject, text) => {
  try {
    // Tạo một bộ gửi email với cấu hình SMTP của Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Sử dụng SSL
      auth: {
        user: "conghaunguyen909@gmail.com", // Địa chỉ email của người gửi
        pass: "mvemebeagmeoijgh", // Mật khẩu email của người gửi
      },
    });

    // Gửi email
    await transporter.sendMail({
      from: "conghaunguyen909@gmail.com", // Địa chỉ email của người gửi
      to: email, // Địa chỉ email của người nhận
      subject: subject, // Tiêu đề email
      text: text, // Nội dung email dạng văn bản thuần
    });

    console.log("Email sent successfully"); // Ghi log khi gửi email thành công
  } catch (error) {
    console.log("Email not sent"); // Ghi log khi gửi email không thành công
    console.error(error); // Ghi log lỗi nếu có lỗi xảy ra
  }
};

module.exports = sendEmail;
