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
      message: 'password and passwordConfirm are not the same',
    },
  },
  passwordChangedAt: Date,
  image: String,
});

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(JWTTimestamp, changedTimeStamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.comparePassword = async function (candidatePassword) {
  console.log(this);
  return await bcrypt.compare(candidatePassword, this.password);
};
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
