const JwtUtil = require('../utils/jwt.utils');
const User = require('../models/user.model');
const ERROR_CODES = require('../utils/error.codes'); // Import mã lỗi

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ // 401 Unauthorized
            status: 'error',
            code: ERROR_CODES.AUTH_TOKEN_MISSING,
            message: 'Authentication token is required.'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = JwtUtil.verifyToken(token); // Hàm này sẽ throw lỗi nếu token không hợp lệ/hết hạn
        
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ // 401 Unauthorized
                status: 'error',
                code: ERROR_CODES.AUTH_USER_NOT_FOUND,
                message: 'User not found or token invalid.'
            });
        }

        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
        };

        next();

    } catch (error) {
        console.error('Error in authMiddleware:', error.message);
        if (error.message.includes('expired')) { // Kiểm tra thông báo lỗi cụ thể từ JWT
            return res.status(401).json({
                status: 'error',
                code: ERROR_CODES.AUTH_TOKEN_EXPIRED,
                message: 'Authentication token has expired. Please log in again.'
            });
        } else if (error.message.includes('invalid') || error.message.includes('malformed')) { // Lỗi token không hợp lệ
             return res.status(401).json({
                status: 'error',
                code: ERROR_CODES.AUTH_TOKEN_INVALID,
                message: 'Invalid authentication token. Please log in again.'
            });
        }
        res.status(500).json({ // Lỗi không xác định
            status: 'error',
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: 'Failed to authenticate token due to an unexpected error.'
        });
    }
};

module.exports = authMiddleware;