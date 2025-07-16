// src/models/currency.model.js
const pool = require('../config/database');

const CurrencyModel = {
    /**
     * Lấy tất cả các đơn vị tiền tệ đang hoạt động từ cơ sở dữ liệu.
     * @returns {Array} Mảng các đối tượng tiền tệ {code, name, symbol}.
     */
    async getAll() {
        try {
            const [rows] = await pool.execute('SELECT code, name, symbol FROM currencies WHERE is_active = TRUE');
            return rows;
        } catch (error) {
            console.error('Error fetching all currencies:', error);
            throw error; // Ném lỗi để controller xử lý
        }
    },
    /**
     * Lấy thông tin một đơn vị tiền tệ theo mã code.
     * @param {string} code - Mã code của đơn vị tiền tệ (ví dụ: 'VND', 'USD').
     * @returns {Object} Đối tượng tiền tệ hoặc undefined nếu không tìm thấy.
     */
    async getByCode(code) {
        try {
            const [rows] = await pool.execute('SELECT code, name, symbol FROM currencies WHERE code = ? AND is_active = TRUE', [code]);
            return rows[0]; // Trả về đối tượng đầu tiên hoặc undefined
        } catch (error) {
            console.error(`Error fetching currency by code ${code}:`, error);
            throw error; // Ném lỗi để controller xử lý
        }
    },

    // Bạn có thể thêm các hàm khác ở đây nếu muốn quản lý (thêm/sửa/xóa) tiền tệ từ API
    // Ví dụ:
    /*
    async create(code, name, symbol) {
        await pool.execute('INSERT INTO currencies (code, name, symbol) VALUES (?, ?, ?)', [code, name, symbol]);
        return code;
    },
    async updateStatus(code, isActive) {
        await pool.execute('UPDATE currencies SET is_active = ? WHERE code = ?', [isActive, code]);
    }
    */
};

module.exports = CurrencyModel;