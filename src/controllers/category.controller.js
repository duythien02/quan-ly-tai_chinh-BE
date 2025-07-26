// src/controllers/category.controller.js
const Category = require('../models/category.model');
const ERROR_CODES = require('../utils/error.codes');

const CategoryController = {
    // [POST] /api/categories
    createCategory: async (req, res, next) => {
        try {
            const { name, type, description } = req.body;
            const userId = req.user.id; // Lấy từ auth.middleware

            // 1. Validate input
            if (!name || !type) {
                return res.status(400).json({
                    status: 400,
                    code: ERROR_CODES.CATEGORY_MISSING_FIELDS,
                    message: 'Name and type are required for a category.'
                });
            }
            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    status: 400,
                    code: ERROR_CODES.CATEGORY_INVALID_TYPE,
                    message: "Category type must be 'income' or 'expense'."
                });
            }

            // 2. Gọi model để tạo mới
            const categoryId = await Category.create(userId, name, type, description);

            // 3. Trả về response
            res.status(201).json({
                status: 201,
                message: 'Category created successfully!',
                data: { id: categoryId, name, type, description }
            });
        } catch (error) {
            // Xử lý lỗi trùng tên danh mục (unique constraint)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ // 409 Conflict
                    status: 409,
                    code: ERROR_CODES.CATEGORY_EXISTS,
                    message: 'A category with this name and type already exists.'
                });
            }
            next(error); // Chuyển các lỗi khác cho errorHandler
        }
    },

    // [GET] /api/categories
    getAllCategories: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const categories = await Category.findByUserId(userId);
            res.status(200).json({
                status: 200,
                message: 'Categories fetched successfully!',
                data: categories
            });
        } catch (error) {
            next(error);
        }
    },

    // [PUT] /api/categories/:id
    updateCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const userId = req.user.id;

            // 1. Validate input
            if (!name) {
                return res.status(400).json({
                    status: 400,
                    code: ERROR_CODES.CATEGORY_MISSING_FIELDS,
                    message: 'Category name is required.'
                });
            }

            // 2. Kiểm tra danh mục có tồn tại và thuộc quyền sở hữu của user không
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    status: 404,
                    code: ERROR_CODES.CATEGORY_NOT_FOUND,
                    message: 'Category not found.'
                });
            }
            if (category.user_id !== userId) {
                return res.status(403).json({ // 403 Forbidden
                    status: 403,
                    code: ERROR_CODES.FORBIDDEN,
                    message: "You don't have permission to update this category."
                });
            }

            // 3. Gọi model để cập nhật
            await Category.update(id, name, description);
            
            res.status(200).json({
                status: 200,
                message: 'Category updated successfully!'
            });
        } catch (error) {
            // Xử lý lỗi trùng tên có thể xảy ra khi update
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    status: 409,
                    code: ERROR_CODES.CATEGORY_EXISTS,
                    message: 'Another category with this name and type already exists.'
                });
            }
            next(error);
        }
    },

    // [DELETE] /api/categories/:id
    deleteCategory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // 1. Kiểm tra danh mục có tồn tại và thuộc quyền sở hữu của user không
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    status: 404,
                    code: ERROR_CODES.CATEGORY_NOT_FOUND,
                    message: 'Category not found.'
                });
            }
            if (category.user_id !== userId) {
                return res.status(403).json({
                    status: 403,
                    code: ERROR_CODES.FORBIDDEN,
                    message: "You don't have permission to delete this category."
                });
            }
            
            // 2. Gọi model để xóa
            await Category.delete(id);

            res.status(200).json({ // Hoặc 204 No Content
                status: 200,
                message: 'Category deleted successfully!'
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = CategoryController;