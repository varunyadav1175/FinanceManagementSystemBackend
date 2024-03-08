// controllers/transactionController.js
const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { Op } = require('sequelize');

// Add transaction controller
exports.addTransaction = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Add transaction logic
    const { type, amount, description } = req.body;
    console.log(req.userId ,type, amount, description)
    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount, 
      description
    });
    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    // Convert startDate and endDate to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Retrieve transactions for the given period
    const transactions = await Transaction.findAll({
      where: {
        userId: req.userId,
        date: {
          [Op.between]: [startDateObj, endDateObj]
        }
      }
    });

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    // Calculate total income, total expenses, and savings for the given period
    const summary = await Transaction.findAll({
      attributes: [
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.literal('CASE WHEN type = \'income\' THEN amount ELSE 0 END')), 'totalIncome'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.literal('CASE WHEN type = \'expense\' THEN amount ELSE 0 END')), 'totalExpenses']
      ],
      where: {
        userId: req.userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Calculate savings
    const totalIncome = summary[0].dataValues.totalIncome || 0;
    const totalExpenses = summary[0].dataValues.totalExpenses || 0;
    const savings = totalIncome - totalExpenses;

    res.json({ totalIncome, totalExpenses, savings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

  exports.deleteTransaction = async (req, res) => {
    try {
      // Delete transaction logic
      const { id } = req.params;
      const transaction = await Transaction.findByPk(id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Check if the transaction belongs to the authenticated user
      if (transaction.userId !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized to delete this transaction' });
    }

    // Delete the transaction
      await transaction.destroy();
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  