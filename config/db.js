const mongoose = require('mongoose');

const connectDB = async () => {
  if (global.mongoose && global.mongoose.conn) return global.mongoose.conn;
  if (!global.mongoose) global.mongoose = { conn: null, promise: null };
  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(process.env.MONGODB_URI);
  }
  global.mongoose.conn = await global.mongoose.promise;
  return global.mongoose.conn;
};

module.exports = connectDB;
