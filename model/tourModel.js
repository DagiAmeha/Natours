const mongoose = require('mongoose');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name!'],
    unique: true,
    minLength: [10, 'a tour must have a minimun of 10 character'],
  },
  duration: Number,
  maxGroupSize: Number,
  difficulty: {
    type: String,
    required: [true, 'a tour must have a difficulty'],
    enum: ['easy', 'medium', 'difficult'],
  },
  ratingsAverage: {
    type: Number,
    min: [0, 'rating must have a value greater than 0'],
    max: [5, 'rating must have a value less than 5'],
  },
  ratingsQuantity: Number,
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
  summary: {
    type: String,
    require: [true, 'a tour must have a summary'],
  },
  description: String,
  imageCover: {
    type: String,
    required: [true, 'a tour must have a imageCover'],
  },
  images: [String],
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  locations: [
    {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  startDates: [Date],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: 'name photo',
  });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
