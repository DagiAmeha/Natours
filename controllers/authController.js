const User = require('../model/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(user.id);

  res.status(200).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if the emaill and password is provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }

  // 2) check if the user exist and the password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user && !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 3) then send the token
  const token = signToken(user.id);
  res.status(200).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not loggedin! Please login', 401));
  }
  // 2) Verification token
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findOne({ _id: payload.id });
  if (!user)
    return next(
      new AppError('A user associated with this token no longer exist!', 401)
    );
  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(payload.iat))
    return next(
      new AppError('password is recently changed! Please login again.', 401)
    );

  // Grant access to the protected route
  req.user = user;
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) check req.body
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(
      new AppError(
        'please provide all the inputs"currentPassword, password, passwordConfirm"',
        400
      )
    );
  }
  // 2) check the current password with the password in the DB
  const user = await User.findById(req.user.id).select('+password');
  console.log(currentPassword);
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Incorrect password!', 401));
  }

  // 3) update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
