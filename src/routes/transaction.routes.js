// src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction.controller');
const protect = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/summary', TransactionController.getTransactionsSummary);
router.post('/create', TransactionController.addTransaction);

module.exports = router;