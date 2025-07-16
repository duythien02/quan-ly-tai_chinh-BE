// src/utils/jwt.utils.js
const jwt = require('jsonwebtoken');
const config = require('../config'); // Import cấu hình từ src/config/index.js

const JwtUtil = {
    // Tạo JWT token
    generateToken: (payload) => {
        try {
            return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Could not generate token.');
        }
    },

    // Xác thực JWT token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, config.JWT_SECRET);
        } catch (error) {
            console.error('Error verifying token:', error);
            // Có thể throw lỗi cụ thể hơn tùy theo loại lỗi của JWT (ví dụ: TokenExpiredError, JsonWebTokenError)
            throw new Error('Invalid or expired token.');
        }
    }
};

module.exports = JwtUtil;