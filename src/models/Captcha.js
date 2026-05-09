const mongoose = require('mongoose');

const CaptchaSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index: document will expire at expiresAt
  }
});

module.exports = mongoose.model('Captcha', CaptchaSchema);
