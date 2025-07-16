// src/app.js
require('dotenv').config(); // Load biến môi trường từ .env

// Đảm bảo file database.js của bạn thiết lập kết nối (ví dụ: tạo pool)
// và xuất ra một đối tượng kết nối có thể được các models sử dụng.
// Nếu file này chỉ thiết lập kết nối mà không export gì, dòng require này vẫn ổn.
require('./config/database');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Lấy PORT từ .env hoặc mặc định 3000

const cors = require('cors'); // Import cors middleware
const errorHandler = require('./middlewares/errorHandler'); // Import error handler của bạn

// Middleware để parse JSON body từ request
app.use(express.json());

// Sử dụng CORS middleware - Cho phép mọi nguồn gốc truy cập (cẩn thận khi triển khai production)
app.use(cors());

// Import routes
// Đảm bảo tên file ở đây khớp chính xác với tên file THỰC TẾ của bạn
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const categoryRoutes = require('./routes/category.routes');
const accountRoutes = require('./routes/account.routes'); // Dòng này quan trọng cho API tạo tài khoản

// Sử dụng các routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Nếu bạn có API quản lý user riêng
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes); // Route cho tài khoản và tiền tệ

// Route đơn giản để kiểm tra server
app.get('/', (req, res) => {
    res.send('Welcome to the Financial Management App API!');
});

// --- Bắt đầu phần xử lý lỗi ---

// Xử lý lỗi 404 (Not Found) - Middleware này sẽ được kích hoạt nếu không có route nào khớp
app.use((req, res, next) => {
    const error = new Error('Endpoint not found.');
    error.status = 404; // Đặt trạng thái HTTP cho lỗi
    next(error); // Chuyển lỗi này đến middleware xử lý lỗi toàn cục
});

// Global Error Handler Middleware - ĐẶT CUỐI CÙNG SAU TẤT CẢ CÁC ROUTES VÀ MIDDLEWARE KHÁC
// Đây là điểm bắt lỗi cuối cùng trong chuỗi middleware của Express
app.use(errorHandler);

// --- Kết thúc phần xử lý lỗi ---

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});