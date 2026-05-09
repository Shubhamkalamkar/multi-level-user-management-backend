require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const result = await User.updateMany({ role: 'Owner' }, { $set: { role: 'Admin' } });
    console.log(`Updated ${result.modifiedCount} users from Owner to Admin.`);
    mongoose.disconnect();
  }).catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
