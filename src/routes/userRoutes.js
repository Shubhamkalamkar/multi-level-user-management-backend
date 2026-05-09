const express = require('express');
const { createNextLevelUser, getDownline, changeNextLevelPassword } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User hierarchy management
 */

/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a next level user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
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
 *         description: Next-level user created
 */
router.post('/create', createNextLevelUser);

/**
 * @swagger
 * /api/users/downline:
 *   get:
 *     summary: Get user's complete downline hierarchy
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns downline users
 */
router.get('/downline', getDownline);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change password of a direct next-level user
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetUserId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 */
router.put('/change-password', changeNextLevelPassword);

module.exports = router;
