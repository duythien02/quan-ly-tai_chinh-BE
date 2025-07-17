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
    /**
     * Lấy danh sách tài khoản của người dùng với phân trang.
     * @param {Object} req - Đối tượng Request của Express. req.query có thể chứa 'page' và 'limit'.
     * @param {Object} res - Đối tượng Response của Express.
     */
    getAccounts: async (req, res) => {
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            return res.status(401).json({
                status: 401,
                code: ERROR_CODES.AUTH_UNAUTHORIZED,
                message: 'Unauthorized.'
            });
        }

        // Lấy tham số phân trang từ query string
        // Sử dụng parseInt để chuyển đổi sang số nguyên.
        // Cung cấp giá trị mặc định nếu không có hoặc không hợp lệ.
        const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là trang 1
        const limit = parseInt(req.query.limit) || 10; // Số lượng mục mỗi trang, mặc định là 10
        const offset = (page - 1) * limit; // Tính toán offset (vị trí bắt đầu lấy dữ liệu)

        // Kiểm tra page và limit phải là số dương
        if (page < 1 || limit < 1) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.INVALID_PAGINATION_PARAMS, // Có thể thêm mã lỗi này
                message: 'Page and limit must be positive integers.'
            });
        }

        try {
            // Gọi hàm từ Account Model để lấy dữ liệu phân trang và tổng số lượng
            // Chúng ta sẽ cần cập nhật Account.findByUserId để hỗ trợ paging
            const { accounts, total } = await Account.findByUserIdPaginated(userId, limit, offset);

            // Tính toán tổng số trang
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