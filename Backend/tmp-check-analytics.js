require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const now = new Date();
    const start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    const values = [];
    for (let w = 0; w < 4; w++) {
      const ws = new Date(start.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const we = new Date(ws.getTime() + 7 * 24 * 60 * 60 * 1000);
      const count = await User.countDocuments({ createdAt: { $gte: ws, $lt: we } });
      values.push({ week: w + 1, start: ws.toISOString(), count });
    }
    console.log(JSON.stringify(values, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
})();