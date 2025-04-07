const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.route('/').get().post();

router.route('/:id').get().patch().delete();

module.exports = router;
