// src/models/user.model.js
const pool = require('../config/database'); // Import pool kết nối database
const UuidUtil = require('../utils/uuid.utils');

const User = {
    // Tìm người dùng theo ID
    findById: async (id) => {
        try {
            const [rows] = await pool.execute('SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?', [id]);
            return rows[0]; // Trả về người dùng đầu tiên tìm thấy
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    },

    // Tìm người dùng theo username (để đăng nhập)
    findByUsername: async (username) => {
        try {
            const [rows] = await pool.execute('SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE username = ?', [username]);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    },

    // Tìm người dùng theo email (để đăng ký, tránh trùng lặp)
    findByEmail: async (email) => {
        try {
            const [rows] = await pool.execute('SELECT id, username, email FROM users WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },

    // Tạo người dùng mới
    create: async (username, email, passwordHash) => {
        const id = UuidUtil.generateUuid();
        try {
            await pool.execute(
            'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
            [id, username, email, passwordHash] // <-- Chèn ID
        );
        return id;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Có thể thêm các phương thức khác như update, delete, v.v. sau này
};

module.exports = User;