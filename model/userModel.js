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
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
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
        return this.password === value;
      },
      message: 'password and passwordConfirm are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  image: String,
});

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    console.log(JWTTimestamp, changedTimeStamp);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword,
) {
  console.log(this);
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.updatePassword = async function (req) {
  this.password = req.body.password;
  this.passwordConfirm = req.body.passwordConfirm;
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  await this.save();
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  console.log(this.password);

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, async function (next) {
  // this.find({ active: true });
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
