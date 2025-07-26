// src/controllers/user.controller.js
const User = require('../models/user.model');

const UserController = {
    // [GET] /api/users/me
    getMe: async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                // Trường hợp này hiếm khi xảy ra vì user đã được xác thực
                return res.status(404).json({
                    status: 404,
                    message: "User not found."
                });
            }

            // Trả về dữ liệu user (model đã không lấy password_hash)
            res.status(200).json({
                status: 200,
                message: "User profile fetched successfully!",
                data: user
            });
        } catch (error) {
            next(error); // Chuyển lỗi đến errorHandler
        }
    }
};

module.exports = UserController;