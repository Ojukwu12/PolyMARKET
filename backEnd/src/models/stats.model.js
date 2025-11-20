const { mongoose } = require('../config/db');
const { Schema } = require('mongoose');

const StatsSchema = new Schema({
  marketId: { type: String, index: true, required: true },
  title: { type: String },
  finalOutcome: { type: String },
  sentimentAtTheTime: { type: Schema.Types.Mixed },
  category: { type: String },
  resolvedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Stats', StatsSchema);
