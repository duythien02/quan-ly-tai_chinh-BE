// src/models/account.model.js
const pool = require('../config/database');
const UuidUtil = require('../utils/uuid.utils');

const AccountModel = {
    /**
     * Tạo một tài khoản mới trong cơ sở dữ liệu.
     * @param {string} userId - ID của người dùng sở hữu tài khoản.
     * @param {string} accountName - Tên của tài khoản.
     * @param {string} currencyCode - Mã tiền tệ của tài khoản (ví dụ: 'VND').
     * @param {number} initialBalance - Số dư ban đầu của tài khoản.
     * @returns {string} ID của tài khoản vừa được tạo.
     */
    async create(userId, accountName, currencyCode, initialBalance) {
        const accountId = UuidUtil.generateUuid();
        const currentBalance = initialBalance;

        try {
            await pool.execute(
                'INSERT INTO accounts (id, user_id, account_name, currency_code, initial_balance, current_balance) VALUES (?, ?, ?, ?, ?, ?)',
                [accountId, userId, accountName, currencyCode, initialBalance, currentBalance]
            );
            return accountId;
        } catch (error) {
            console.error('Error creating account:', error);
            throw error; // Ném lỗi để controller xử lý
        }
    },

    /**
     * Tìm tất cả tài khoản thuộc về một người dùng cụ thể.
     * @param {string} userId - ID của người dùng.
     * @returns {Array} Mảng các đối tượng tài khoản.
     */
    async findByUserId(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, account_name, currency_code, initial_balance, current_balance FROM accounts WHERE user_id = ?',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching accounts for user ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Tìm một tài khoản theo ID của nó.
     * @param {string} accountId - ID của tài khoản.
     * @returns {Object} Đối tượng tài khoản hoặc undefined nếu không tìm thấy.
     */
    async findById(accountId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, user_id, account_name, currency_code, initial_balance, current_balance, created_at FROM accounts WHERE id = ?',
                [accountId]
            );
            return rows[0]; // Trả về đối tượng đầu tiên hoặc undefined
        } catch (error) {
            console.error(`Error fetching account by ID ${accountId}:`, error);
            throw error;
        }
    },

    /**
     * Cập nhật số dư hiện tại của một tài khoản.
     * @param {string} accountId - ID của tài khoản cần cập nhật.
     * @param {number} newBalance - Số dư mới.
     * @param {Object} [connection=pool] - Tùy chọn, đối tượng kết nối database (dùng cho transaction).
     */
    async updateBalance(accountId, newBalance, connection = pool) {
        try {
            await connection.execute(
                'UPDATE accounts SET current_balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newBalance, accountId]
            );
        } catch (error) {
            console.error(`Error updating balance for account ${accountId}:`, error);
            throw error;
        }
    },
    /**
     * Tìm tất cả tài khoản thuộc về một người dùng cụ thể với phân trang.
     * @param {string} userId - ID của người dùng.
     * @param {number} limit - Số lượng bản ghi tối đa mỗi trang.
     * @param {number} offset - Vị trí bắt đầu lấy bản ghi.
     * @returns {Object} Đối tượng chứa mảng tài khoản và tổng số lượng.
     */
    async findByUserIdPaginated(userId, limit, offset) {
        try {
            // Truy vấn để lấy tổng số tài khoản
            const [totalRows] = await pool.execute(
                'SELECT COUNT(*) AS total FROM accounts WHERE user_id = ?',
                [userId]
            );
            const total = totalRows[0].total;

            // Truy vấn để lấy dữ liệu tài khoản với LIMIT và OFFSET
            const [accounts] = await pool.execute(
                `SELECT id, account_name, currency_code, initial_balance, current_balance, created_at
                 FROM accounts
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );

            return { accounts, total }; // Trả về cả danh sách tài khoản và tổng số lượng
        } catch (error) {
            console.error(`Error fetching paginated accounts for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = AccountModel;