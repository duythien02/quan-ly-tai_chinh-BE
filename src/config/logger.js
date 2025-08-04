// src/config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');

// Định nghĩa định dạng cho log
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Cấu hình transport để xoay vòng file log hàng ngày
const dailyRotateFileTransport = new DailyRotateFile({
    level: 'debug', // Ghi lại tất cả các log từ debug trở lên
    filename: path.join(logDirectory, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true, // Nén file log cũ
    maxSize: '20m', // Kích thước tối đa của file log trước khi tạo file mới
    maxFiles: '14d', // Giữ lại log trong 14 ngày
    format: logFormat
});

// Cấu hình logger
const logger = winston.createLogger({
    transports: [
        // Hiển thị log ra console (cho môi trường development)
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        // Ghi log ra file
        dailyRotateFileTransport
    ],
    exitOnError: false // Không thoát ứng dụng khi có lỗi không được bắt
});

// Tạo một stream để có thể dùng với các thư viện như morgan (nếu cần)
logger.stream = {
    write: function(message, encoding) {
        logger.info(message.trim());
    },
};

module.exports = logger;