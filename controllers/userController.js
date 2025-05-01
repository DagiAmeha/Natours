const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../model/userModel');

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updatePassword.',
        400,
      ),
    );
  }

  const allowedFields = ['name', 'email'];
  const filteredBody = {};
  Object.keys(req.body).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredBody[key] = req.body[key];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = (req, res, next) => {};

exports.getAllUsers = async (req, res, next) => {
  res.status(500).json({
    statsu: 'error',
    message: 'This route is not yet definded',
  });
};
exports.getUser = async (req, res, next) => {
  res.status(500).json({
    statsu: 'error',
    message: 'This route is not yet definded',
  });
};
exports.createNewUser = async (req, res, next) => {
  res.status(500).json({
    statsu: 'error',
    message: 'This route is not yet definded',
  });
};
exports.updateUser = async (req, res, next) => {
  res.status(500).json({
    statsu: 'error',
    message: 'This route is not yet definded',
  });
};
exports.deleteUser = async (req, res, next) => {
  res.status(500).json({
    statsu: 'error',
    message: 'This route is not yet definded',
  });
};
