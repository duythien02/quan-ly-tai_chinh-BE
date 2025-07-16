// src/config/db.config.js
module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    DATABASE: process.env.DB_NAME || 'quan_ly_tai_chinh',
    PORT: process.env.DB_PORT || 3306,
    // pool: { // Cấu hình pool kết nối nếu muốn sử dụng connection pooling
    //     connectionLimit: 10,
    //     queueLimit: 0
    // }
};