const { mongoose } = require('../config/db');
const { Schema } = require('mongoose');

const OutcomeSchema = new Schema({
  name: { type: String },
  price: { type: Number },
  probability: { type: Number }
}, { _id: false });

const MarketSchema = new Schema({
  marketId: { type: String, index: true, required: true, unique: true },
  title: { type: String },
  outcomes: { type: [OutcomeSchema], default: [] },
  prices: { type: Schema.Types.Mixed },
  volume: { type: Number, default: 0 },
  liquidity: { type: Number, default: 0 },
  resolution: { type: Schema.Types.Mixed },
  expiry: { type: Date, index: true },
  status: { type: String, enum: ['open','closed','resolved'], default: 'open' },
  category: { type: String, default: 'Other' },
  sentimentScore: { type: Number, default: null },
  bullishPct: { type: Number, default: null },
  bearishPct: { type: Number, default: null },
  resolvedOutcome: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  removedAt: { type: Date, default: null },
  raw: { type: Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Market', MarketSchema);
