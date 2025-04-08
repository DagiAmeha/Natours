const AppError = require('../utils/AppError');

const validationErrorHandler = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  error.statusCode = 400;

  return new AppError(errors, error.statusCode);
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

    prodError(error, res);
  }
};
