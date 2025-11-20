// src/services/sentiment.service.js
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeTweetsAverage(tweets) {
  if (!Array.isArray(tweets) || tweets.length === 0) return null;
  const scores = tweets.map(t => sentiment.analyze(t).score);
  const sum = scores.reduce((a, b) => a + b, 0);
  return sum / scores.length;
}

function analyzeTextsAverage(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return null;
  const scores = texts.map(t => sentiment.analyze(t).score);
  const sum = scores.reduce((a, b) => a + b, 0);
  return sum / scores.length;
}

function normalizeTo01(score) {
  if (score === null || score === undefined) return null;
  // Clamp to [-1, 1] then map to [0, 1]
  const clamped = Math.max(-1, Math.min(1, score));
  return (clamped + 1) / 2;
}

function aggregateTweetSentiment(tweets) {
  if (!Array.isArray(tweets) || tweets.length === 0) {
    return {
      avgScore: null,
      bullishPct: null,
      bearishPct: null,
      positives: 0,
      negatives: 0,
      neutrals: 0,
      total: 0,
    };
  }
  const scores = tweets.map(t => sentiment.analyze(t).score);
  const sum = scores.reduce((a, b) => a + b, 0);
  const total = scores.length;
  const positives = scores.filter(s => s > 0).length;
  const negatives = scores.filter(s => s < 0).length;
  const neutrals = total - positives - negatives;
  const bullishPct = (positives / total) * 100;
  const bearishPct = (negatives / total) * 100;
  return { avgScore: sum / total, bullishPct, bearishPct, positives, negatives, neutrals, total };
}

module.exports = { analyzeTweetsAverage, analyzeTextsAverage, normalizeTo01, aggregateTweetSentiment };
