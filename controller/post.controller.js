const postModel = require("../models/post.model");
const cloudinary = require("cloudinary").v2;

exports.getpost = async (req, res) => {
  try {
    const getpost = await postModel.post.find();
    if (!getpost) {
      return res
        .status(401)
        .json({ status: 401, message: "get list post false!" });
    }
    return res.status(200).json({
      status: 200,
      data: getpost,
      message: "Get list post successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
exports.addpost = async (req, res) => {
  const filedata = req.file;
  const post = req.body;
  try {
    if (
      post.title == "" ||
      (!filedata && post.image == "") ||
      post.content == ""
    ) {
      if (filedata) {
        // Nếu có lỗi và có tệp ảnh đã tải lên, hủy tệp ảnh trên Cloudinary
        cloudinary.uploader.destroy(filedata.filename);
      }
      return res
        .status(500)
        .json({ message: "Các trường không được bỏ trống" });
    } else {
      if (filedata) {
        post.image = filedata.path; // Cập nhật đường dẫn ảnh
      }
      const items = new postModel.post(post);
      await items.save();
      console.log(items);
      return res.status(200).json("thêm bài post thành công");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
exports.uploadpost = async (req, res) => {
  const postID = req.params.id;
  const filePost = req.file;
  const post = req.body;
  console.log(post)
  try {
    if (filePost) {
      post.image = filePost?.path;
    }
    const updatepost = await postModel.post.findByIdAndUpdate(postID, post);
    console.log(updatepost)
    // Kiểm tra nếu không cập nhật được tin nhắn
    if (!updatepost) {
      return res
        .status(401)
        .json({ status: 401, message: "Update post false!" });
    }

    return res.status(201).json({
      status: 201,
      message: "Update post successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

exports.deletepost = async (req, res) => {
  const postID = req.params.id;
  try {
    const delete_post = await postModel.post.findByIdAndDelete(postID);
    console.log(postID);
    if (!delete_post) {
      return res.status(401).json({ status: 401, message: "delete false!" });
    }

    return res
      .status(201)
      .json({ status: 201, message: "delete successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: error.message });
  }
};
