const { acount } = require('../models/acount.model')
const messageModel = require('../models/message.model')
const Total = require('../models/total.model')
const returnRes = require('../utils/config')
const runPrompt = require('../utils/convertMessage')
const returnTotal = require('../utils/total')

// Lấy danh sách tin nhắn
exports.getListMessage = async (req, res, next) => {
    const userID = req.query.userID
    console.log(req.query.userID)
    if (!userID) {
        return returnRes(res, 404, 'Invalid userID')
    }
    try {
        const messageList = await messageModel.message.find({ userID })
        console.log(messageList)
        // Kiểm tra nếu không có tin nhắn
        if (!messageList) {
            return returnRes(res, 401, 'get list message false!')
        }

        return returnRes(res, 200, messageList, 'get list message success')
    } catch (error) {
        console.log(error)
        return returnRes(res, 500, error.message)
    }
}

exports.getMessageById = async (req, res, next) => {
    try {
        const messageId = req.params.id

        if (!messageId) {
            return returnRes(res, 404, 'Invalid message id')
        }
        const findMessageById = await messageModel.message.findById(messageId)

        // Kiểm tra nếu không có tin nhắn
        if (!findMessageById) {
            return returnRes(res, 401, 'Message not found')
        }

        return returnRes(res, 200, findMessageById, 'get message successfully')
    } catch (error) {
        console.log(error)
        return returnRes(res, 500, error.message)
    }
}

// Tạo tin nhắn mới
exports.createMessage = async (req, res, next) => {
    if (req.method == 'POST') {
        try {
            // Lưu tin nhắn ban đầu vào cơ sở dữ liệu
            let message = new messageModel.message()
            message.message = req.body.message
            message.userID = req.body.userID
            message.code = req.body.code
            message.price = req.body.price
            if (!req.body.message || !req.body.userID) {
                return returnRes(res, 404, 'invalid message || userID')
            }
            const findUserID = await acount.findById(req.body.userID)
            console.log(findUserID)
            if (!findUserID) {
                return returnRes(res, 404, 'userID is not exists')
            }
            if (!req.body.message) {
                return returnRes(res, 404, 'Invalid message')
            }
            const newMessage = await message.save()

            console.log('newMessage ', newMessage)

            if (!message.code || !message.price) {
                // Gọi hàm convertMessage để lấy thông tin
                const convertMessage = await runPrompt(newMessage?.message)

                // Cập nhật tin nhắn ban đầu với thông tin từ convertMessage
                newMessage.price = convertMessage?.price
                newMessage.code = convertMessage?.code

                // Lưu lại tin nhắn đã cập nhật
                await newMessage.save()
            }
            // Đảm bảo rằng bạn đã định nghĩa userID và code từ convertMessage
            const { userID, code, price } = newMessage

            await returnTotal(userID, code, price)
            return returnRes(res, 201, newMessage, 'create successfully')
        } catch (error) {
            console.log(error)
            return returnRes(res, 500, error.message)
        }
    }

    // Nếu không phải phương thức POST, trả về trang tạo tin nhắn
    res.render('message/create-message')
}

// Cập nhật tin nhắn
exports.updateMessage = async (req, res, next) => {
    const messageID = req.params.id
    const messageUpdate = req.body

    try {
        const updateMessage = await messageModel.message.findByIdAndUpdate(
            messageID,
            messageUpdate
        )

        // Kiểm tra nếu không cập nhật được tin nhắn
        if (!updateMessage) {
            return res
                .status(401)
                .json({ status: 401, message: 'Update message false!' })
        }

        return res.status(201).json({
            status: 201,
            message: 'Update message successfully!',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

// Xóa tin nhắn
exports.deleteMessage = async (req, res, next) => {
    const messageID = req.params.id

    try {
        const deleteMessage = await messageModel.message.findByIdAndDelete(
            messageID
        )

        // Kiểm tra nếu không xóa được tin nhắn
        if (!deleteMessage) {
            return res
                .status(401)
                .json({ status: 401, message: 'delete false!' })
        }

        return res
            .status(201)
            .json({ status: 201, message: 'delete successfully!' })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

// Lấy list message theo limit
exports.loadMoreMessages = async (req, res, next) => {
    try {
        const { userid, code, limit, skip } = req.query // Nhận limit và skip từ frontend

        // Chuyển limit và skip thành số nguyên
        const limitInt = parseInt(limit)
        const skipInt = parseInt(skip)

        // Lấy danh sách tin nhắn dựa trên limit và skip
        const messageList = await messageModel.message
            .find({ code: code, userID: userid })
            .limit(limitInt)
            .skip(skipInt)

        // Kiểm tra nếu không có tin nhắn
        if (!messageList) {
            return res
                .status(401)
                .json({ status: 401, message: 'No more messages found' })
        }

        return res.status(200).json({
            status: 200,
            data: messageList,
            message: 'Get messages successfully!',
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}
// Hàm "filterMessages" để lọc danh sách tin nhắn theo các yêu cầu
exports.filterMessagesbyCode = async (req, res, next) => {
    try {
        const { code, userid } = req.query // Nhận startDate và endDate từ frontend

        // Truy vấn MongoDB để lọc theo "code" và khoảng thời gian
        const messageList = await messageModel.message.find({
            code: code,
            userID: userid, // Thay thế bằng "code" bạn muốn lọc
        })

        // Kiểm tra nếu không có tin nhắn
        if (!messageList) {
            return res
                .status(404)
                .json({ status: 404, message: 'No messages found' })
        }

        return res.status(200).json({
            status: 200,
            data: messageList,
            message: `Messages filtered by code and date range`,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}

// Hàm "filterMessages" để lọc danh sách tin nhắn theo các yêu cầu
exports.filterMessagesbyCodeANDTime = async (req, res, next) => {
    try {
        const { code, startDate, endDate, userid } = req.query // Nhận startDate và endDate từ frontend

        // Truy vấn MongoDB để lọc theo "code" và khoảng thời gian
        const messageList = await messageModel.message.find({
            code: code, // Thay thế bằng "code" bạn muốn lọc
            createdAt: { $gte: startDate, $lte: endDate },
            userID: userid,
        })

        // Kiểm tra nếu không có tin nhắn
        if (!messageList) {
            return res
                .status(404)
                .json({ status: 404, message: 'No messages found' })
        }

        return res.status(200).json({
            status: 200,
            data: messageList,
            message: `Messages filtered by code and date range`,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ status: 500, message: error.message })
    }
}
