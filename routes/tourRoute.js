const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router.get(
  '/top-5-cheap-tours',
  tourController.aliasTopTours,
  tourController.getAllTours,
);
router.get('/tours-stats', authController.protect, tourController.tourStats);
router.get(
  '/monthly-plan/:year',
  authController.protect,
  tourController.getMonthlyPlan,
);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, tourController.createNewTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect, tourController.updateTour)
  .delete(authController.protect, tourController.deleteTour);

module.exports = router;
