// src/controllers/transaction.controller.js
const TransactionModel = require('../models/transaction.model');
const logger = require('../config/logger');

const getFormattedDate = (date) => date.toISOString().split('T')[0];

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
    }
};

module.exports = TransactionController;