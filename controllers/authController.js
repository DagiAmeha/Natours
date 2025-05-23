const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const User = require('../model/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};

const createAndSendToken = (res, user) => {
  const token = signToken(user.id);

  res.cookie('jwt', token, {
    httpOnly: true,
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 'sucess',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(res, user);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if the emaill and password is provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password'));
  }

  // 2) check if the user exist and the password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log(user);
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // 3) then send the token
  createAndSendToken(res, user);
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
      new AppError('A user associated with this token no longer exist!', 401),
    );
  // 4) Check if user changed password after the token was issued
  if (user.changedPasswordAfter(payload.iat))
    return next(
      new AppError('password is recently changed! Please login again.', 401),
    );

  // Grant access to the protected route
  req.user = user;
  next();
});

exports.protectTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 403),
      );
    }
    next();
  };
};
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) check req.body
  const { currentPassword, password, passwordConfirm } = req.body;

  if (!currentPassword || !password || !passwordConfirm) {
    return next(
      new AppError(
        'please provide all the inputs"currentPassword, password, passwordConfirm"',
        400,
      ),
    );
  }
  // 2) check the current password with the password in the DB
  const user = await User.findById(req.user.id).select('+password');
  console.log(currentPassword);
  if (!(await user.comparePassword(currentPassword, user.password))) {
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('There is no user with this email!', 400));
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({
    validateBeforeSave: false,
  });

  const resetURL = `http://127.0.0.1/users/resetPassword/${token}`;

  const message = `Please click on the following link, or paste this into your browser to complete the process:  ${resetURL}
    If you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const currentUser = await User.findOne({ passwordResetToken: hashedToken });

  if (!currentUser || Date.now() > currentUser.passwordResetExpires) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }

  await currentUser.updatePassword(req);

  res.status(200).json({
    status: 'success',
    message: 'Password is successfully updated',
  });
});
