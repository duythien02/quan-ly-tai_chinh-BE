// src/app.js
require('dotenv').config();

require('./config/database');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());

app.use(cors());

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const transactionRoutes = require('./routes/transaction.routes');
const categoryRoutes = require('./routes/category.routes');
const accountRoutes = require('./routes/account.routes');

// Sử dụng các routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);

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