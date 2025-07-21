// src/utils/jwt.utils.js
const jwt = require('jsonwebtoken');
const config = require('../config'); // Import cấu hình từ src/config/index.js

const JwtUtil = {
    // Tạo JWT token
    generateAccessToken: (payload) => {
        try {
            return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        } catch (error) {
            console.error('Error generating token:', error);
            throw new Error('Could not generate token.');
        }
    },

    // Tạo Refresh Token
    generateRefreshToken: (payload) => {
        try {
            // Refresh token nên có thời gian hết hạn dài hơn và sử dụng secret riêng
            return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES_IN });
        } catch (error) {
            console.error('Error generating refresh token:', error);
            throw new Error('Could not generate refresh token.');
        }
    },

    // Xác thực Token (access hoặc refresh)
    verifyToken: (token, tokenType = 'access') => { // Thêm tham số tokenType
        let secret;
        if (tokenType === 'access') {
            secret = config.JWT_SECRET;
        } else if (tokenType === 'refresh') {
            secret = config.JWT_REFRESH_SECRET;
        } else {
            // Trường hợp tokenType không hợp lệ
            throw new Error('Invalid token type specified for verification.');
        }

        try {
            return jwt.verify(token, secret);
        } catch (error) {
            console.error(`Error verifying ${tokenType} token:`, error);
            // Có thể throw lỗi cụ thể hơn tùy theo loại lỗi của JWT
            // Ví dụ: if (error.name === 'TokenExpiredError') throw new Error('Token expired.');
            // else if (error.name === 'JsonWebTokenError') throw new Error('Invalid token.');
            throw error; // Ném lỗi gốc để có thể phân biệt loại lỗi ở controller
        }
    }
};

module.exports = JwtUtil;