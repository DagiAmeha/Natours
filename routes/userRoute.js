const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// router.patch('/updateMe', authController.updateMe);
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
router.route('/').get().post();

router.route('/:id').get().patch().delete();

module.exports = router;
