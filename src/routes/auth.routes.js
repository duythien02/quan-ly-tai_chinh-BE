// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller'); // Import controller

// Tuyến đường (route) cho Đăng ký người dùng
// POST /api/auth/register
router.post('/register', authController.register);

// Tuyến đường (route) cho Đăng nhập người dùng
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;