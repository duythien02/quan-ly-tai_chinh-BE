// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const protect = require('../middlewares/auth.middleware');

// This endpoint requires authentication, so we use the `protect` middleware
router.get('/me', protect, UserController.getMe);

module.exports = router;