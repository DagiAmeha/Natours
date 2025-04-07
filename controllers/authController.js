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
    //   const hashedPassword = await bcrypt.hash(user);
    res.status(200).json({
      status: 'sucess',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const user = await User.find({ email: req.body.email });
    const token = signToken(user.id);
    res.status(200).json({
      status: 'sucess',
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    console.log(err);
  }
};
