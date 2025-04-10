const Tour = require('../model/tourModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage';
  next();
};
exports.getAllTours = catchAsync(async (req, res, next) => {
  // 1) basic filtering
  const filterStr = ['sort', 'fields', 'limit', 'page'];
  let filterObj = { ...req.query };
  Object.keys(req.query).forEach((el) => {
    if (filterStr.includes(el)) delete filterObj[el];
  });

  filterObj = JSON.stringify(filterObj).replace(
    /\b(gt|gte|lt|lte)\b/g,
    (val) => `$${val}`
  );

  let query = Tour.find(JSON.parse(filterObj));

  // 2) sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ createdAt: -1, _id: 1 });
  }

  // 3) Limting field
  if (req.query.fields) {
    const limitingStr = req.query.fields.split(',').join(' ');
    query = query.select(limitingStr);
  } else {
    query = query.select('-__v');
  }

  // 4) Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  // excuting the query
  const tours = await query;

  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: {
      tours,
    },
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({ _id: req.params.id });

  if (tour.length === 0)
    next(
      new AppError(
        `Inalid Id: there is no tour with an Id "${req.params.id}`,
        400
      )
    );

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.createNewTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, {
    new: true,
  });

  if (tour.length === 0)
    throw new Error(`Inalid Id: there is no tour with an Id ${req.params.id}`);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.tourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStart: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
