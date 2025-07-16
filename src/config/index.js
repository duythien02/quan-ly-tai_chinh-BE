// src/config/index.js
module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key', // Thay đổi chuỗi này trong .env
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h', // Thời gian hết hạn của token
    // Các cấu hình khác nếu cần
};