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
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    statsu: 'success',
    length: users.length,
    data: {
      users,
    },
  });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
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
