// src/utils/uuid.utils.js
const { v4: uuidv4 } = require('uuid');

const UuidUtil = {
    generateUuid: () => {
        return uuidv4();
    }
};

module.exports = UuidUtil;