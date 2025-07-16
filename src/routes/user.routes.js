// Ví dụ: src/routes/auth.routes.js
const express = require('express');
const router = express.Router(); // <= Dòng này phải có để khởi tạo router

// Sau này bạn sẽ định nghĩa các endpoint ở đây, ví dụ:
// router.post('/register', authController.register);

module.exports = router; // <= Và dòng này phải có để export router