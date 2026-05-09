const express = require('express');
const { register, login, logout, getCaptcha, refreshToken } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and authorization routes
 */

/**
 * @swagger
 * /api/auth/captcha:
 *   get:
 *     summary: Generate a CAPTCHA SVG and ID
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Captcha SVG and ID
 */
router.get('/captcha', getCaptcha);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register the first owner or test users
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               captchaId:
 *                 type: string
 *               captchaAnswer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', protect, logout);

module.exports = router;
