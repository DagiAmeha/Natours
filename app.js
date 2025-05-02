const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');

const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/userRoute');
const { globalErrorHandler } = require('./controllers/errorController');
const AppError = require('./utils/AppError');

const app = express();

//  Global middleware
// set security HTTp headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(express.json());
app.use(express.static('public'));

// Route Handlers
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);

// handling Route that are not defined in our api
app.all('*', (req, res, next) => {
  next(new AppError(`This path ${req.originalUrl} isn't on this server!`, 404));
});

// Use the global error handler
app.use(globalErrorHandler);

module.exports = app;
