// src/controllers/auth.controller.js
const User = require('../models/user.model');
const PasswordUtil = require('../utils/password.utils');
const JwtUtil = require('../utils/jwt.utils');
const ERROR_CODES = require('../utils/error.codes'); // Import mã lỗi

const AuthController = {
    // Hàm xử lý Đăng ký người dùng mới
    register: async (req, res) => {
        const { username, email, password } = req.body;

        // 1. Kiểm tra dữ liệu đầu vào cơ bản
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.AUTH_REQUIRED_FIELDS_MISSING,
                message: 'Username, email, and password are required.'
            });
        }

        try {
            // 2. Kiểm tra xem username hoặc email đã tồn tại chưa
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(409).json({ // 409 Conflict
                    status: 409,
                    code: ERROR_CODES.AUTH_USERNAME_TAKEN,
                    message: 'Username already taken.'
                });
            }

            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(409).json({ // 409 Conflict
                    status: 409,
                    code: ERROR_CODES.AUTH_EMAIL_REGISTERED,
                    message: 'Email already registered.'
                });
            }

            // 3. Băm (hash) mật khẩu trước khi lưu vào DB
            const passwordHash = await PasswordUtil.hashPassword(password);

            // 4. Tạo người dùng mới trong DB
            const newUserId = await User.create(username, email, passwordHash);

            // 5. Tạo JWT token cho người dùng mới
            const accessToken = JwtUtil.generateToken({ id: newUserId, username, email });

            // 6. Trả về response thành công
            res.status(200).json({
                status: 200,
                message: 'User registered successfully!',
                data: {
                    id: newUserId,
                    username,
                    email,
                    accessToken
                },
            });

        } catch (error) {
            console.error('Error during registration:', error);
            res.status(500).json({
                status: 500,
                code: ERROR_CODES.INTERNAL_SERVER_ERROR, // Mã lỗi chung cho lỗi server
                message: 'Internal server error during registration.'
            });
        }
    },

    // Hàm xử lý Đăng nhập người dùng
    login: async (req, res) => {
        const { username, password } = req.body;
        // 1. Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({
                status: 400,
                code: ERROR_CODES.AUTH_REQUIRED_FIELDS_MISSING,
                message: 'Username and password are required.'
            });
        }

        try {
            // 2. Tìm người dùng theo username
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ // 401 Unauthorized
                    status: 401,
                    code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                    message: 'Invalid username or password.' // Tránh nói rõ là username sai để tăng bảo mật
                });
            }

            // 3. So sánh mật khẩu đã nhập với mật khẩu đã băm trong DB
            const isPasswordValid = await PasswordUtil.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ // 401 Unauthorized
                    status: 401,
                    code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
                    message: 'Invalid username or password.'
                });
            }

            // 4. Mật khẩu đúng, tạo JWT token
            userPayload = {
                id: user.id,
                username: user.username,
                email: user.email
            };
            const accessToken = JwtUtil.generateToken(userPayload);

            // 5. Trả về response thành công
            res.status(200).json({
                status: 200,
                message: 'Logged in successfully!',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    accessToken
                },
            });

        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({
                status: 500,
                code: ERROR_CODES.INTERNAL_SERVER_ERROR,
                message: 'Internal server error during login.'
            });
        }
    }
};

module.exports = AuthController;