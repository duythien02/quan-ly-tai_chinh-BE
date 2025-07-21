// src/config/index.js
module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your_access_secret_key', // Thay đổi chuỗi này trong .env
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m', // Thời gian hết hạn của token
    
    // Thêm các biến môi trường cho Refresh Token
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key', // Thay đổi chuỗi này trong .env
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Thời gian sống của Refresh Token (ví dụ: 7 ngày)
};