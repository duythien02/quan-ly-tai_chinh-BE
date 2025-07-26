// src/routes/category.routes.js
const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
// Import theo "cách cũ"
const protect = require('../middlewares/auth.middleware');

// Định nghĩa các endpoints cho CRUD và áp dụng `protect` cho từng cái
router.post('/', protect, CategoryController.createCategory);
router.get('/', protect, CategoryController.getAllCategories);
router.put('/:id', protect, CategoryController.updateCategory);
router.delete('/:id', protect, CategoryController.deleteCategory);

module.exports = router;