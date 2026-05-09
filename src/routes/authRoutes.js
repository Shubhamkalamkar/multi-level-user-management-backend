const express = require('express');
const { register, login, logout, getCaptcha, refreshToken } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/captcha', getCaptcha);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);

module.exports = router;
