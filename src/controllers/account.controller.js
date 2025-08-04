const Account = require('../models/account.model');
const Currency = require('../models/currency.model');
const ERROR_CODES = require('../utils/error.codes');
const logger = require('../config/logger');

const AccountController = {
    // API để tạo tài khoản mới
    createAccount: async (req, res) => {
        // Lấy userId từ req.user đã được gắn bởi middleware xác thực (protect)
        const userId = req.user ? req.user.id : null;

        // Kiểm tra xem userId có tồn tại không (người dùng đã được xác thực)
        if (!userId) {
            return res.status(401).json({
                status: 401,
                code: ERROR_CODES.AUTH_UNAUTHORIZED,
                message: 'Unauthorized: User ID not found in token.'
            });
        }

        // Lấy dữ liệu từ body của request
        const { accountName, currencyCode, initialBalance } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!accountName || !currencyCode || initialBalance === undefined || initialBalance === null) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.ACCOUNT_REQUIRED_FIELDS_MISSING,
                message: 'Account name, currency code, and initial balance are required.'
            });
        }

        // --- Bắt đầu phần logic kiểm tra và xử lý Currency ---
        // Chuyển mã tiền tệ sang chữ hoa để đảm bảo tính nhất quán (ví dụ: 'vnd' -> 'VND')
        const normalizedCurrencyCode = currencyCode.toUpperCase();

        // Kiểm tra initialBalance phải là số và không âm
        if (typeof initialBalance !== 'number' || initialBalance < 0) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.ACCOUNT_INVALID_BALANCE,
                message: 'Initial balance must be a non-negative number.'
            });
        }

        try {
            // Gọi hàm tạo tài khoản từ Account Model
            const newAccountId = await Account.create(userId, accountName, normalizedCurrencyCode, initialBalance);

            // Trả về phản hồi thành công
            res.status(200).json({ // 201 Created
                status: 200,
                message: 'Account created successfully!',
                data: {
                    id: newAccountId,
                    accountName,
                    currencyCode: normalizedCurrencyCode,
                    initialBalance,
                    currentBalance: initialBalance // Ban đầu currentBalance = initialBalance
                }
            });

        } catch (error) {
            console.error('Error creating account:', error);
            res.status(500).json({
                status: 500,
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Internal server error during account creation.'
            });
        }
    },

    getCurrencies: async (req, res) => {
        try {
            const currencies = await Currency.getAll();
            res.status(200).json({
                status: 200,
                message: 'Currencies retrieved successfully!',
                data: currencies
            });
        } catch (error) {
            console.error('Error fetching currencies:', error);
            res.status(500).json({
                status: 500,
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Internal server error when fetching currencies.'
            });
        }
    },
    getAccounts: async (req, res) => {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({
                status: 401,
                code: ERROR_CODES.AUTH_UNAUTHORIZED,
                message: 'Unauthorized.'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.INVALID_PAGINATION_PARAMS,
                message: 'Page and limit must be positive integers.'
            });
        }

        try {
            const { accounts, total } = await Account.findByUserIdPaginated(userId, limit, offset);

            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                status: 200,
                message: 'Accounts retrieved successfully!',
                data: {
                    items: accounts,
                    currentPage: page,
                    pageSize: limit,
                    totalPages: totalPages,
                    totalItems: total,
                }
            });
        } catch (error) {
            console.error('Error fetching accounts with pagination:', error);
            res.status(500).json({
                status: 500,
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Internal server error when fetching accounts.'
            });
        }
    }
};

module.exports = AccountController;