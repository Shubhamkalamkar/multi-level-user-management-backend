const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createNextLevelUser = async (req, res) => {
  try {
    const { username, password, commissionRate } = req.body;
    const parentId = req.user._id;

    // Ensure parent exists
    const parent = await User.findById(parentId);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });

    const newAncestors = [...parent.ancestors, parentId];
    
    const user = await User.create({
      username,
      password,
      role: 'User',
      parentId,
      ancestors: newAncestors,
      commissionRate: commissionRate || 0
    });

    res.status(201).json({ success: true, data: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getDownline = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all users where the current user's ID is in their ancestors array
    const downline = await User.find({ ancestors: userId })
      .select('-password')
      .populate('parentId', 'username');

    // Build hierarchy tree if needed, or return flat list
    res.status(200).json({ success: true, count: downline.length, data: downline });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changeNextLevelPassword = async (req, res) => {
  try {
    const { targetUserId, newPassword } = req.body;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify it's an immediate child
    if (targetUser.parentId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only change password for your immediate next-level users' });
    }

    targetUser.password = newPassword; // Pre-save hook will hash it
    await targetUser.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
