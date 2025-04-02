const Tour = require('../model/tourModel');

exports.getAllTours = async (req, res, next) => {
  try {
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
  } catch (err) {
    console.log(err);
  }
};
exports.getTour = async (req, res, next) => {
  try {
    const tour = await Tour.find({ id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Inalid Id: there is no tour with an Id ${req.params.id}`,
    });
  }
};
exports.createNewTour = async (req, res, next) => {
  try {
    const tour = await Tour.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, {
      new: true,
    });

    if (!tour) throw new Error();

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Inalid Id: there is no tour with an Id ${req.params.id}`,
    });
  }
};
exports.deleteTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: `Inalid Id: there is no tour with an Id ${req.params.id}`,
    });
  }
};
