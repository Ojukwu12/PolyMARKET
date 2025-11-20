const { mongoose } = require('../config/db');
const { Schema } = require('mongoose');

const WinRateSchema = new Schema({
  bullishWins: { type: Number, default: 0 },
  bearishWins: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { timestamps: true });

WinRateSchema.virtual('bullishWinRate').get(function () {
  if (!this.total) return 0;
  return (this.bullishWins / this.total) * 100;
});

WinRateSchema.virtual('bearishWinRate').get(function () {
  if (!this.total) return 0;
  return (this.bearishWins / this.total) * 100;
});

WinRateSchema.virtual('totalWinRate').get(function () {
  if (!this.total) return 0;
  return ((this.bullishWins + this.bearishWins) / (this.total * 1)) * 100;
});

module.exports = mongoose.model('WinRate', WinRateSchema);
