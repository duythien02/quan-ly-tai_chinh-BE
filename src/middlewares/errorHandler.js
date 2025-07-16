// src/middleware/errorHandler.js
const ERROR_CODES = require('../utils/error.codes'); // Đảm bảo đường dẫn chính xác

/**
 * Global Error Handler Middleware
 * Middleware xử lý lỗi tập trung cho ứng dụng Express.
 *
 * @param {Error} err - Đối tượng lỗi được truyền từ các route/middleware khác (bằng next(err)).
 * @param {Object} req - Đối tượng Request của Express.
 * @param {Object} res - Đối tượng Response của Express.
 * @param {Function} next - Hàm next middleware.
 */
const errorHandler = (err, req, res, next) => {
    // Log lỗi ra console để gỡ lỗi (trong môi trường dev)
    // Trong môi trường production, bạn có thể gửi lỗi này đến một dịch vụ logging như Sentry, Loggly, New Relic, v.v.
    console.error(err.stack);

    // Xác định mã trạng thái HTTP
    // Mặc định là 500 (Internal Server Error) nếu không có trạng thái cụ thể
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Định dạng phản hồi lỗi
    res.status(statusCode).json({
        status: statusCode,
        // Sử dụng mã lỗi cụ thể nếu có, nếu không thì dùng mã lỗi chung
        code: err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
        // Trong môi trường development, hiển thị thông báo lỗi chi tiết
        // Trong môi trường production, có thể hiển thị thông báo chung chung hơn để bảo mật
        message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : (err.message || 'Something went wrong'),
        // Chỉ hiển thị stack trace trong môi trường development để gỡ lỗi
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;