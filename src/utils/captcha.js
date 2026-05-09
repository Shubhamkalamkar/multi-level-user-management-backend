const svgCaptcha = require('svg-captcha');
const { v4: uuidv4 } = require('uuid');
const Captcha = require('../models/Captcha');

const generateCaptcha = async () => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 3,
    color: true,
    background: '#f0f0f0'
  });

  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Captcha.create({
    sessionId,
    text: captcha.text,
    expiresAt
  });

  return { sessionId, data: captcha.data };
};

const verifyCaptcha = async (sessionId, text) => {
  const captchaDoc = await Captcha.findOne({ sessionId });
  if (!captchaDoc) return false;
  
  const isValid = captchaDoc.text.toLowerCase() === text.toLowerCase();
  await Captcha.deleteOne({ sessionId }); // One-time use
  return isValid;
};

module.exports = { generateCaptcha, verifyCaptcha };
