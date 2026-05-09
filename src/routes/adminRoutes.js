const express = require('express');
const { getAllNextLevel, getFullDownline, adminTransfer, getBalanceSummary } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Owner'));

router.get('/next-level', getAllNextLevel);
router.get('/downline/:id', getFullDownline);
router.post('/transfer', adminTransfer);
router.get('/balance-summary', getBalanceSummary);

module.exports = router;
