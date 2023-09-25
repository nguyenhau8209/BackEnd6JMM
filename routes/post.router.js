const express = require("express");
const routes = express.Router();
const cloudinary = require("../middleWare/cloudinary.middlewere");
const postController = require("../controller/post.controller");
routes.post("/add_Post", cloudinary.single("image"), postController.addpost);
routes.get("/get_post", postController.getpost);
routes.delete("/delete_post/:id", postController.deletepost);
routes.put('/update_post/:id',postController.uploadpost)
module.exports = routes;
