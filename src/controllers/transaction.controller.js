// src/controllers/transaction.controller.js
const TransactionModel = require('../models/transaction.model');
const logger = require('../config/logger');

const getFormattedDate = (date) => date.toISOString().split('T')[0];

const parseDate = (dateString) => {
    // Kiểm tra xem đầu vào có phải là một chuỗi hợp lệ không
    if (!dateString || typeof dateString !== 'string') return null;
    try {
        const parts = dateString.split('/');
        if (parts.length !== 3) return null; // Phải có 3 phần DD, MM, YYYY
        // parts[2] = YYYY, parts[1] = MM, parts[0] = DD
        // Đảm bảo các phần tử có độ dài đúng
        if (parts[2].length !== 4 || parts[1].length > 2 || parts[0].length > 2) return null;
        
        // Trả về định dạng đúng cho MySQL
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    } catch (e) {
        // Nếu có lỗi xảy ra trong quá trình xử lý, trả về null
        return null;
    }
};

const TransactionController = {
    getTransactionsSummary: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { account_id, start_date, end_date } = req.query;

            if (!account_id) {
                return res.status(400).json({ message: 'account_id is required.' });
            }

            const endDateObj = end_date ? new Date(end_date) : new Date();
            const startDateObj = start_date ? new Date(start_date) : new Date(new Date().setDate(endDateObj.getDate() - 29));

            const formattedEndDate = getFormattedDate(endDateObj);
            const formattedStartDate = getFormattedDate(startDateObj);

            // 1. Gọi Model để lấy dữ liệu (Model trả về một mảng)
            const dailySummaries = await TransactionModel.getDailySummaryByAccount(userId, account_id, formattedStartDate, formattedEndDate);

            // 2. Xử lý và hợp nhất dữ liệu
            const transactionMap = new Map();

            dailySummaries.items.forEach(item => {
                transactionMap.set(item.date, {
                    total_income: parseFloat(item.total_income),
                    total_expense: parseFloat(item.total_expense)
                });
            });

            // 3. Tạo danh sách đầy đủ các ngày
            const allDaysData = [];
            let currentDate = new Date(formattedStartDate);
            while (currentDate <= new Date(formattedEndDate)) {
                const dateStr = getFormattedDate(currentDate);

                if (transactionMap.has(dateStr)) {
                    const data = transactionMap.get(dateStr);
                    allDaysData.push({
                        date: dateStr,
                        total_income: data.total_income,
                        total_expense: data.total_expense
                    });
                } else {
                    allDaysData.push({
                        date: dateStr,
                        total_income: 0,
                        total_expense: 0
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // 4. Trả về kết quả
            res.status(200).json({
                status: 200,
                message: "Daily summaries fetched successfully!",
                data: {
                    items: allDaysData
                } 
            });

        } catch (error) {
            next(error);
        }
    },
    addTransaction: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const {
                accountId,
                categoryId,
                type,
                amount,
                date
            } = req.body;

            const description = req.body.description || null;
            const parsedDate = parseDate(date);

            // 1. Xác thực dữ liệu đầu vào
            if (!accountId || !categoryId || !type || !amount || !parsedDate) {
                console.log(accountId, categoryId, type, amount, parsedDate);
                return res.status(400).json({
                    status: 400,
                    message: "Missing required fields: accountId, categoryId, type, amount, parsedDate are required."
                });
            }

            if (typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    status: 400,
                    message: "Amount must be a positive number."
                });
            }

            if (!['income', 'expense'].includes(type)) {
                return res.status(400).json({
                    status: 400,
                    message: "Type must be 'income' or 'expense'."
                });
            }

            // 2. Gọi Model để thực hiện logic nghiệp vụ
            const transactionId = await TransactionModel.addTransaction({
                userId: userId,
                accountId: accountId,
                categoryId: categoryId,
                type: type,
                amount: amount,
                description: description,
                date: parsedDate
            });

            // 3. Trả về response thành công
            res.status(200).json({
                status: 200,
                message: "Transaction added successfully!",
                data: {
                    transaction_id: transactionId
                }
            });

        } catch (error) {
            // Lỗi sẽ được bắt và chuyển đến errorHandler chung
            next(error);
        }
    }
};

module.exports = TransactionController;