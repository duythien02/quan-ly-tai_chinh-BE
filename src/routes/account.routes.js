// src/routes/accountRoutes.js
const express = require('express');
const accountController = require('../controllers/account.controller');
const protect  = require('../middlewares/auth.middleware');

const router = express.Router();

// Route to create a new account (requires authentication token)
router.post('/create', protect, accountController.createAccount);

// Route to get all accounts for the user (requires authentication token)
router.get('/', protect, accountController.getAccounts);

// Route để lấy danh sách các loại tiền tệ (có thể không cần xác thực nếu bạn muốn public)
router.get('/currencies', accountController.getCurrencies);

// ... (các route khác nếu có, ví dụ /categories, /transactions)

module.exports = router;