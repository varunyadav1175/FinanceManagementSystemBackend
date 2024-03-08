// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/Users');
const { validationResult } = require('express-validator');

exports.login = async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

// Middleware for protected routes
exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = parseInt(decoded.userId);
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

exports.signup = async (req, res) => {
    try {
       // Validate input
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
       }
      
      const { username, password } = req.body;
      
      // Check if username already exists
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
  
      // Hash the password
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      // Create new user
      const newUser = await User.create({ username, password: hashedPassword });
  
      // Generate JWT token
      const token = jwt.sign({ userId: newUser.userId }, process.env.JWT_SECRET, { expiresIn: '12h' });
      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };