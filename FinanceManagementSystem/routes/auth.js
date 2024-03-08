// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

// Validation rules for signup route
const signupValidationRules = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ];

router.post('/login', authController.login);
router.post('/signup', authController.signup);

module.exports = router;
