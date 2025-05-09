const express = require('express');
const reviewController = require('../controllers/reviewController');
const authContoller = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authContoller.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);
module.exports = router;
