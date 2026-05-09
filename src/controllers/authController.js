const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateCaptcha, verifyCaptcha } = require('../utils/captcha');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  const refreshOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .cookie('refreshToken', refreshToken, refreshOptions)
    .json({ success: true, token, user: { id: user._id, username: user.username, role: user.role } });
};

exports.getCaptcha = async (req, res) => {
  try {
    const { sessionId, data } = await generateCaptcha();
    res.status(200).json({ success: true, sessionId, captcha: data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Captcha generation failed' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // For this example, allow first user to be Admin if no Admin exists
    const adminExists = await User.findOne({ role: 'Admin' });
    const role = adminExists ? 'User' : 'Admin';
    
    const user = await User.create({ username, password, role });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password, sessionId, captchaText } = req.body;

    if (!username || !password || !sessionId || !captchaText) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const isCaptchaValid = await verifyCaptcha(sessionId, captchaText);
    if (!isCaptchaValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired CAPTCHA' });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.status(200).json({ success: true, data: {} });
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};
