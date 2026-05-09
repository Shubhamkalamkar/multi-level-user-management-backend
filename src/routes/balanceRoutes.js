const express = require('express');
const { recharge, transfer, getStatement, getBalance } = require('../controllers/balanceController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/', getBalance);
router.post('/recharge', recharge);
router.post('/transfer', transfer);
router.get('/statement', getStatement);

module.exports = router;
