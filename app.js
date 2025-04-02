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

module.exports = app;
