const express = require('express');
const { recharge, transfer, getStatement, getBalance } = require('../controllers/balanceController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Balance
 *   description: Balance and transaction management
 */

/**
 * @swagger
 * /api/balance:
 *   get:
 *     summary: Get current user balance
 *     tags: [Balance]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 */
router.get('/', getBalance);

/**
 * @swagger
 * /api/balance/recharge:
 *   post:
 *     summary: Self recharge balance (Owner only)
 *     tags: [Balance]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Balance recharged
 */
router.post('/recharge', recharge);

/**
 * @swagger
 * /api/balance/transfer:
 *   post:
 *     summary: Transfer balance to downline user
 *     tags: [Balance]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Balance transferred successfully
 */
router.post('/transfer', transfer);

/**
 * @swagger
 * /api/balance/statement:
 *   get:
 *     summary: Get user transaction statement
 *     tags: [Balance]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Transaction statement history
 */
router.get('/statement', getStatement);

module.exports = router;
