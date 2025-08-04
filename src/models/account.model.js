// src/models/account.model.js
const pool = require('../config/database');
const UuidUtil = require('../utils/uuid.utils');

const AccountModel = {
    async create(userId, accountName, currencyCode, initialBalance, description = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [currencyRows] = await connection.execute(
                'SELECT symbol FROM currencies WHERE code = ?',
                [currencyCode]
            );

            if (currencyRows.length === 0) {
                throw new Error(`Invalid currency code: ${currencyCode}`);
            }
            const currencySymbol = currencyRows[0].symbol;

            const [countRows] = await connection.execute(
                'SELECT COUNT(*) as count FROM accounts WHERE user_id = ?',
                [userId]
            );
            const isMain = countRows[0].count === 0;

            const accountId = UuidUtil.generateUuid();
            await connection.execute(
                'INSERT INTO accounts (id, user_id, account_name, currency_code, currency_symbol, initial_balance, current_balance, description, is_main) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [accountId, userId, accountName, currencyCode, currencySymbol, initialBalance, initialBalance, description, isMain]
            );

            await connection.commit();
            logger.info(`Account ${accountId} created successfully for user ${userId}`);
            return accountId;

        } catch (error) {
            await connection.rollback();
            logger.error(`Error creating account for user ${userId}: ${error.message}`);
            throw error;
        } finally {
            connection.release();
        }
    },

    async findByUserId(userId) {
        try {
            
            const [rows] = await pool.execute(
                'SELECT id, account_name, currency_code, initial_balance, current_balance, is_main FROM accounts WHERE user_id = ?',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error(`Error fetching accounts for user ${userId}:`, error);
            throw error;
        }
    },

    async findById(accountId) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, user_id, account_name, currency_code, initial_balance, current_balance, created_at, is_main FROM accounts WHERE id = ?',
                [accountId]
            );
            return rows[0];
        } catch (error) {
            console.error(`Error fetching account by ID ${accountId}:`, error);
            throw error;
        }
    },

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

    async findByUserIdPaginated(userId, limit, offset) {
        try {
            // Bước 1: Vẫn lấy tổng số tài khoản để phân trang (query này nhanh và hiệu quả)
            const [totalRows] = await pool.execute('SELECT COUNT(*) AS total FROM accounts WHERE user_id = ?', [userId]);
            const total = totalRows[0].total;

            // Bước 2: Viết lại câu lệnh chính để lấy dữ liệu tài khoản kèm thu/chi
            const sqlQuery = `
                SELECT
                    a.id,
                    a.account_name,
                    a.currency_code,
                    a.currency_symbol,
                    a.current_balance,
                    a.description,
                    a.is_main,
                    COALESCE(SUM(CASE WHEN t.transaction_type = 'income' THEN t.amount ELSE 0 END), 0) AS total_income,
                    COALESCE(SUM(CASE WHEN t.transaction_type = 'expense' THEN t.amount ELSE 0 END), 0) AS total_expense
                FROM
                    accounts a
                LEFT JOIN
                    transactions t ON a.id = t.account_id
                WHERE
                    a.user_id = ?
                GROUP BY
                    a.id
                ORDER BY
                    a.created_at DESC
                LIMIT ?
                OFFSET ?;
            `;
            const [rows] = await pool.execute(sqlQuery, [userId, limit.toString(), offset.toString()]);

            const accounts = rows.map(account => ({
                ...account,
                current_balance: parseFloat(account.current_balance),
                is_main: Boolean(account.is_main),
                total_income: parseFloat(account.total_income),
                total_expense: parseFloat(account.total_expense)
            }));

            return { accounts, total };

        } catch (error) {
            logger.error(`Error fetching paginated accounts for user ${userId}: ${error.message}`);
            throw error;
        }
    },

    async checkIfUserHasAccounts(userId) {
        try {
            const [rows] = await pool.execute(
                // Query này sẽ dừng ngay khi tìm thấy dòng đầu tiên.
                'SELECT 1 FROM accounts WHERE user_id = ? LIMIT 1',
                [userId]
            );
            // Nếu query trả về bất kỳ dòng nào (rows.length > 0), nghĩa là có tài khoản.
            return rows.length > 0;
        } catch (error) {
            console.error(`Error checking accounts existence for user ${userId}:`, error);
            throw error;
        }
    }
};

module.exports = AccountModel;