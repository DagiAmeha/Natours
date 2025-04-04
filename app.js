const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/tourRoute');
const express = require('express');
const app = express();

// Global Middlewares
app.use(express.json());
app.use(express.static('public'));

// Route Handlers
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

// handling Route that are not defined in our api
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

module.exports = app;
