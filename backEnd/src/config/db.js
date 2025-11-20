const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let _conn = null;
async function connect() {
  if (_conn) return _conn;
  if (!MONGO_URI) {
    console.warn('MONGO_URI not configured; skipping MongoDB connection.');
    return null;
  }
  try {
    _conn = await mongoose.connect(MONGO_URI, { autoIndex: false });
    console.log('Connected to MongoDB');
    return _conn;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err && err.message ? err.message : err);
    throw err;
  }
}

module.exports = { connect, mongoose };
