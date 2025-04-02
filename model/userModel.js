const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'please provide an email'],
    unique: true,
    validate: [validator.isEmail, 'Email is not in the right format'],
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    min: [8, 'password must have atlease 8 characters'],
  },
  passwordConfirm: {
    type: String,
    require: [true, 'please confirm your password'],
    validate: {
      validator: function (value) {
        this.password === value;
      },
      message: 'the password you provided is different with the password',
    },
  },
  image: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
