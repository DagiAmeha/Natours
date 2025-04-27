class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const filterStr = ['sort', 'fields', 'limit', 'page'];
    let filterObj = { ...this.queryString };

    Object.keys(this.queryString).forEach((el) => {
      if (filterStr.includes(el)) delete filterObj[el];
    });

    filterObj = JSON.stringify(filterObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (val) => `$${val}`,
    );
    this.query = this.query.find(JSON.parse(filterObj));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort({ createdAt: -1, _id: 1 });
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const limitingStr = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(limitingStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
