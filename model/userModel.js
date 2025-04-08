const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

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
  role: {
    type: String,
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'please provide a password'],
    min: [8, 'password must have atlease 8 characters'],
    select: false,
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

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(this.password, candidatePassword);
};
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
});
const User = mongoose.model('User', userSchema);

module.exports = User;
