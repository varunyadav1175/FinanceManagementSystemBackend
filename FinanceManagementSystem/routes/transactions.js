// routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

router.post('/',authController.authenticate, transactionController.addTransaction);
router.get('/',authController.authenticate, transactionController.getTransactions);
router.get('/summary',authController.authenticate, transactionController.getTransactionSummary);
router.delete('/:id',authController.authenticate, transactionController.deleteTransaction);

module.exports = router;
