const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { emitBalanceUpdate } = require('../utils/socket');

exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, balance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recharge = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;

    if (req.user.role !== 'Owner') {
      return res.status(403).json({ success: false, message: 'Only Owner can self-recharge' });
    }

    const user = await User.findById(userId);
    user.balance += amount;
    await user.save();

    emitBalanceUpdate(user._id, user.balance);

    res.status(200).json({ success: true, balance: user.balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { targetUserId, amount, description } = req.body;
    const senderId = req.user._id;

    const sender = await User.findById(senderId).session(session);
    const receiver = await User.findById(targetUserId).session(session);

    if (!receiver) throw new Error('Receiver not found');
    
    // Ensure receiver is a direct child (unless Admin overrides, but this route is for normal transfer)
    if (receiver.parentId.toString() !== senderId.toString() && req.user.role !== 'Admin' && req.user.role !== 'Owner') {
       throw new Error('You can only transfer to your direct downline');
    }

    if (sender.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Commission logic (bonus)
    const commission = (amount * receiver.commissionRate) / 100;
    const transferAmount = amount - commission;

    sender.balance -= amount;
    receiver.balance += transferAmount;

    await sender.save({ session });
    await receiver.save({ session });

    const transaction = await Transaction.create([{
      senderId,
      receiverId: targetUserId,
      amount: transferAmount,
      type: 'CREDIT',
      commission,
      description
    }], { session });

    await session.commitTransaction();
    session.endSession();

    emitBalanceUpdate(sender._id, sender.balance);
    emitBalanceUpdate(receiver._id, receiver.balance);

    res.status(200).json({ success: true, transaction: transaction[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStatement = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate('senderId', 'username').populate('receiverId', 'username').sort({ timestamp: -1 });

    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
