const catchAsync = require('../utils/catchAsync');
const Review = require('../model/reviewModel');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  // allow nexted routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const filterObj = {};
  if (req.params.tourId) {
    filterObj.tour = req.params.tourId;
  }
  const reviews = await Review.find(filterObj);

  res.status(200).json({
    statsu: 'success',
    length: reviews.length,
    data: {
      reviews,
    },
  });
});
exports.getReview = factory.getOne(Review);
exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating, tour, user } = req.body;

  const newReview = await Review.create({ review, rating, tour, user });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
