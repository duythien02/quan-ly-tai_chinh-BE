// src/config/database.js
const mysql = require('mysql2/promise'); // Sử dụng promise API để dễ làm việc với async/await
const dbConfig = require('./db.config'); // Import cấu hình database từ db.config.js

// Tạo một pool kết nối để quản lý các kết nối database hiệu quả
// Connection pooling giúp tái sử dụng các kết nối đã có, giảm overhead khi mở/đóng kết nối mới.
const pool = mysql.createPool({
    host: dbConfig.HOST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DATABASE,
    port: dbConfig.PORT,
    waitForConnections: true, // Nếu không có kết nối khả dụng, đợi cho đến khi có
    connectionLimit: 10,     // Tối đa 10 kết nối đồng thời
    queueLimit: 0            // Hàng đợi không giới hạn cho các kết nối chờ
});

// Kiểm tra kết nối database
pool.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL database!');
        connection.release(); // Giải phóng kết nối sau khi kiểm tra
    })
    .catch(err => {
        console.error('Error connecting to MySQL database:', err.message);
        process.exit(1); // Thoát ứng dụng nếu không thể kết nối DB
    });

module.exports = pool; // Export pool để sử dụng trong các models