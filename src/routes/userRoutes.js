const express = require('express');
const { createNextLevelUser, getDownline, changeNextLevelPassword } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/create', createNextLevelUser);
router.get('/downline', getDownline);
router.put('/change-password', changeNextLevelPassword);

module.exports = router;
