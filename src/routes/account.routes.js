// src/routes/accountRoutes.js
const express = require('express');
const accountController = require('../controllers/account.controller');
const protect  = require('../middlewares/auth.middleware');
console.log('protect:', protect);

const router = express.Router();

// Route để tạo tài khoản mới (cần xác thực token)
router.post('/create', protect, accountController.createAccount);

// Route để lấy tất cả tài khoản của người dùng (cần xác thực token)
router.get('/', protect, accountController.getAccounts);

// Route để lấy danh sách các loại tiền tệ (có thể không cần xác thực nếu bạn muốn public)
router.get('/currencies', accountController.getCurrencies);

// ... (các route khác nếu có, ví dụ /categories, /transactions)

module.exports = router;