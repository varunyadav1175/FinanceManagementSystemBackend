// index.js
const express = require('express');
const bodyParser = require('body-parser');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const sequelize = require('./config/database');
const rateLimit = require('express-rate-limit');
const app = express();

// Define rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Apply the rate limiter to all routes
app.use(limiter);

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/transactions', transactionsRouter);
app.use('/auth', authRouter);

// Set up event listener for when Sequelize connects to the database
sequelize.authenticate()
  .then(() => {
    console.log('Connected to database');
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => console.error('Error connecting to database:', error));

// Log IP address used by Sequelize to connect to MySQL
sequelize.options.host && console.log('Connecting to database with IP:', sequelize.options.host);
