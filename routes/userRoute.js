const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);
// router.delete('/deleteMe', authController.deleteMe);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router
  .route('/')
  .get(
    authController.protect,
    authController.protectTo('admin', 'lead-guide'),
    userController.getAllUsers,
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.protectTo('admin', 'lead-guide'),
    userController.getUser,
  )
  .patch(
    authController.protect,
    authController.protectTo('admin', 'lead-guide'),
    userController.updateUser,
  )
  .delete(
    authController.protect,
    authController.protectTo('admin', 'lead-guide'),
    userController.deleteUser,
  );

module.exports = router;
