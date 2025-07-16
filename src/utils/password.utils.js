// src/utils/password.utils.js
const bcrypt = require('bcryptjs');

const saltRounds = 10; // Số vòng lặp để băm. Số càng cao, càng an toàn nhưng càng tốn tài nguyên. 10 là mức tốt.

const PasswordUtil = {
    // Hàm băm mật khẩu
    hashPassword: async (password) => {
        try {
            const salt = await bcrypt.genSalt(saltRounds);
            const hash = await bcrypt.hash(password, salt);
            return hash;
        } catch (error) {
            console.error('Error hashing password:', error);
            throw new Error('Could not hash password.');
        }
    },

    // Hàm so sánh mật khẩu đã băm với mật khẩu gốc
    comparePassword: async (password, hash) => {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            console.error('Error comparing password:', error);
            throw new Error('Could not compare password.');
        }
    }
};

module.exports = PasswordUtil;