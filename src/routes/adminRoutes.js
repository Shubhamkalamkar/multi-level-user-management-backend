const express = require('express');
const { getAllNextLevel, getFullDownline, adminTransfer, getBalanceSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Owner'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations and reporting
 */

/**
 * @swagger
 * /api/admin/next-level:
 *   get:
 *     summary: Get all direct children users
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Next level users
 */
router.get('/next-level', getAllNextLevel);

/**
 * @swagger
 * /api/admin/downline/{id}:
 *   get:
 *     summary: Get full downline for a specific user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full downline array
 */
router.get('/downline/:id', getFullDownline);

/**
 * @swagger
 * /api/admin/transfer:
 *   post:
 *     summary: Admin transfer deducting from target's parent
 *     tags: [Admin]
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
 *         description: Transfer successful
 */
router.post('/transfer', adminTransfer);

/**
 * @swagger
 * /api/admin/balance-summary:
 *   get:
 *     summary: Get total balance summary by role
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: System balance summary
 */
router.get('/balance-summary', getBalanceSummary);

module.exports = router;
