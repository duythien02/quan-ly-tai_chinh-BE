// src/models/transaction.model.js
const pool = require('../config/database');
const logger = require('../config/logger');
const UuidUtil = require('../utils/uuid.utils');

const TransactionModel = {
    /**
     * Lấy dữ liệu tổng hợp thu/chi theo từng ngày của một tài khoản.
     * @param {string} userId - ID của người dùng để bảo mật.
     * @param {string} accountId - ID của tài khoản cần xem.
     * @param {string} startDate - Ngày bắt đầu (YYYY-MM-DD).
     * @param {string} endDate - Ngày kết thúc (YYYY-MM-DD).
     * @returns {Array} Mảng các object { date, total_income, total_expense }
     */
    async getDailySummaryByAccount(userId, accountId, startDate, endDate) {
        try {
            const sqlQuery = `
                SELECT
                    DATE_FORMAT(transaction_date, '%Y-%m-%d') as date,
                    COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
                    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
                FROM
                    transactions
                WHERE
                    user_id = ?
                    AND account_id = ?
                    AND transaction_date >= ?
                    AND transaction_date < DATE_ADD(?, INTERVAL 1 DAY)
                GROUP BY
                    DATE(transaction_date)
                ORDER BY
                    date DESC;
            `;
            
            const [rows] = await pool.execute(sqlQuery, [userId, accountId, startDate, endDate]);

            // Chuyển đổi kiểu dữ liệu string từ DB về number
            return {
                items: rows.map(row => ({
                    date: row.date,
                    total_income: parseFloat(row.total_income),
                    total_expense: parseFloat(row.total_expense)
                }))
            }

        } catch (error) {
            logger.error(`Error fetching daily summary for user ${userId}, account ${accountId}: ${error.message}`);
            throw error;
        }
    },
    /**
     * Thêm một giao dịch mới và cập nhật số dư tài khoản trong một transaction.
     * @param {object} transactionDetails - Object chứa thông tin giao dịch.
     * @returns {string} ID của giao dịch vừa được tạo.
     */
    async addTransaction(transactionDetails) {
        const { userId, accountId, categoryId, type, amount, description, date } = transactionDetails;

        // Lấy một kết nối từ pool để quản lý transaction
        const connection = await pool.getConnection();
        try {
            // Bắt đầu một transaction
            await connection.beginTransaction();

            // 1. Chèn giao dịch mới vào bảng `transactions`
            const transactionId = UuidUtil.generateUuid();
            const transactionQuery = `
                INSERT INTO transactions (id, user_id, account_id, category_id, transaction_type, amount, description, transaction_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            `;
            const params = [transactionId, userId, accountId, categoryId, type, amount, description, date];
            logger.debug('Executing INSERT with params:', { params }); // Ghi log ra file để kiểm tra
            
            await connection.execute(transactionQuery, [transactionId, userId, accountId, categoryId, type, amount, description, date]);

            // 2. Cập nhật số dư trong bảng `accounts`
            // Sử dụng một câu lệnh duy nhất để tăng hoặc giảm số dư
            let balanceChangeQuery;
            if (type === 'income') {
                balanceChangeQuery = 'UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?';
            } else if (type === 'expense') {
                balanceChangeQuery = 'UPDATE accounts SET current_balance = current_balance - ? WHERE id = ?';
            } else {
                // Nếu là 'transfer', chúng ta sẽ xử lý phức tạp hơn sau này. Hiện tại chỉ hỗ trợ income/expense.
                throw new Error("Unsupported transaction type for automatic balance update.");
            }
            
            await connection.execute(balanceChangeQuery, [amount, accountId]);

            // 3. Nếu tất cả các bước trên thành công, commit transaction
            await connection.commit();
            
            logger.info(`Transaction ${transactionId} added and account ${accountId} balance updated successfully.`);
            return transactionId;

        } catch (error) {
            // 4. Nếu có bất kỳ lỗi nào, rollback tất cả các thay đổi
            await connection.rollback();
            logger.error(`Failed to add transaction. Rolled back changes. Error: ${error.message}`);
            throw error; // Ném lỗi để controller xử lý
        } finally {
            // 5. Luôn luôn trả kết nối về pool sau khi hoàn tất
            connection.release();
        }
    }
};

module.exports = TransactionModel;