const User = require('../model/userModel');
const jwt = require('jsonwebtoken');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};
exports.signup = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if the emaill and password is provided
    if (!email || !password) {
      return new Error('Please provide email and password');
    }

    // 2) check if the user exist and the password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user && !(await user.comparePassword(password))) {
      next(new AppError('Invalid email or password', 401));
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
  } catch (err) {
    next(err);
  }
};

exports.protect = (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return new Error('You are not loggedin! Please login');
  }
  // 2) Verification token
  // 3) Check if user still exists
  // 4) Check if user changed password after the token was issued
};
