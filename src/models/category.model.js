// src/models/category.model.js
const pool = require('../config/database');
const UuidUtil = require('../utils/uuid.utils');

const CategoryModel = {
    async create(userId, name, type, description = null) {
        const categoryId = UuidUtil.generateUuid();
        try {
            await pool.execute(
                'INSERT INTO categories (id, user_id, name, type, description) VALUES (?, ?, ?, ?, ?)',
                [categoryId, userId, name, type, description]
            );
            return categoryId;
        } catch (error) {
            console.error('Error creating category:', error);
            // Ném lỗi để controller xử lý, đặc biệt là lỗi UNIQUE constraint
            throw error;
        }
    },
    async findByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, name, type, description, icon_url, created_at FROM categories WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching categories for user ${userId}:`, error);
            throw error;
        }
    },

    async findById(categoryId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, user_id, name, type, description, icon_url FROM categories WHERE id = ?',
                [categoryId]
            );
            return rows[0];
        } catch (error) {
            console.error(`Error fetching category by ID ${categoryId}:`, error);
            throw error;
        }
    },

    async update(categoryId, name, description) {
        try {
            const [result] = await pool.execute(
                'UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, description, categoryId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error updating category ${categoryId}:`, error);
            throw error;
        }
    },

    async delete(categoryId) {
        try {
            const [result] = await pool.execute(
                'DELETE FROM categories WHERE id = ?',
                [categoryId]
            );
            return result.affectedRows;
        } catch (error) {
            console.error(`Error deleting category ${categoryId}:`, error);
            throw error;
        }
    },
};

module.exports = CategoryModel;