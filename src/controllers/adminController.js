const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { emitBalanceUpdate } = require('../utils/socket');

exports.getAllNextLevel = async (req, res) => {
  try {
    const users = await User.find({ parentId: req.user._id }).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFullDownline = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const users = await User.find({ ancestors: targetUserId }).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminTransfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { targetUserId, amount, description } = req.body;

    const targetUser = await User.findById(targetUserId).session(session);
    if (!targetUser) throw new Error('Target user not found');
    
    if (!targetUser.parentId) throw new Error('Target user has no parent to deduct from');

    const parentUser = await User.findById(targetUser.parentId).session(session);

    if (parentUser.balance < amount) {
      throw new Error(`Parent user (${parentUser.username}) has insufficient balance`);
    }

    parentUser.balance -= amount;
    targetUser.balance += amount;

    await parentUser.save({ session });
    await targetUser.save({ session });

    const transaction = await Transaction.create([{
      senderId: parentUser._id,
      receiverId: targetUserId,
      amount,
      type: 'CREDIT',
      description: description || 'Admin initiated transfer'
    }], { session });

    await session.commitTransaction();
    session.endSession();

    emitBalanceUpdate(parentUser._id, parentUser.balance);
    emitBalanceUpdate(targetUser._id, targetUser.balance);

    res.status(200).json({ success: true, transaction: transaction[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBalanceSummary = async (req, res) => {
  try {
    const summary = await User.aggregate([
      {
        $group: {
          _id: '$role',
          totalBalance: { $sum: '$balance' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSystemBalance = summary.reduce((acc, curr) => acc + curr.totalBalance, 0);

    res.status(200).json({ success: true, totalSystemBalance, breakdown: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
