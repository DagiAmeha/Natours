const AppError = require('../utils/AppError');

const validationErrorHandler = (error) => {
  const errors = Object.values(error.errors)
    .map((el) => el.message)
    .join('. ');

  return new AppError(errors, 400);
};

const duplicateErrorHandler = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const message = `Duplicate value '${value}' for field '${field}' is not allowed.`;

  return new AppError(message, 400);
};

const castErrorHandler = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

//Error Handler For Production Environment
const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!',
    });
  }
};

//Error Handler For Development Environment

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

exports.globalErrorHandler = (err, req, res, next) => {
  err.status = err.status || 'fail';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));

    if (err.name === 'ValidationError') error = validationErrorHandler(error);
    if (err.code === 11000) error = duplicateErrorHandler(error);
    if (err.name === 'CastError') error = castErrorHandler(error);

    prodError(error, res);
  }
};
