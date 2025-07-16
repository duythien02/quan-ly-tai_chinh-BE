const Account = require('../models/account.model');
const Currency = require('../models/currency.model');
const ERROR_CODES = require('../utils/error.codes');

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
            res.status(201).json({ // 201 Created
                status: 201,
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

    // API để lấy danh sách các loại tiền tệ có sẵn (cho frontend chọn)
    getCurrencies: async (req, res) => {
        try {
            const currencies = await Currency.getAll(); // Gọi hàm lấy tất cả tiền tệ từ Currency Model
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

    // Bạn có thể có thêm các API khác như getAccounts, updateAccount, deleteAccount...
    // Ví dụ: Lấy tất cả tài khoản của người dùng hiện tại
    getAccounts: async (req, res) => {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({ status: 401, code: ERROR_CODES.AUTH_UNAUTHORIZED, message: 'Unauthorized.' });
        }
        try {
            const accounts = await Account.findByUserId(userId);
            res.status(200).json({ status: 200, message: 'Accounts retrieved successfully!', data: accounts });
        } catch (error) {
            console.error('Error fetching accounts:', error);
            res.status(500).json({ status: 500, code: ERROR_CODES.INTERNAL_SERVER_ERROR, message: 'Internal server error when fetching accounts.' });
        }
    }
};

module.exports = AccountController;