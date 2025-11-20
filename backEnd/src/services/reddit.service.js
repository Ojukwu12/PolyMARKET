// src/services/reddit.service.js
const fetch = require('node-fetch');

const STOPWORDS = new Set(['the','and','for','with','will','this','that','have','from','into','over','more','less','been','being','are','was','were','can','may','might','would','could','should','how','what','does','about','between','in']);
function sanitizeQuery(raw) {
  if (!raw) return 'polymarket';
  const words = raw.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w.length > 2 && !STOPWORDS.has(w));
  return words.slice(0,5).join(' ') || 'polymarket';
}

async function fetchRedditPosts(query, limit = 10) {
  const base = sanitizeQuery(query);
  const q = encodeURIComponent(base);
  const url = `https://www.reddit.com/search.json?q=${q}&limit=${Math.min(limit, 25)}`;
  const attempts = 2;
  for (let i=0;i<attempts;i++) {
    try {
      const res = await fetch(url, { timeout: 8000, headers: { 'User-Agent': 'polymarket-dashboard/1.0 (+contact:dev@example.com)' } });
      if (!res.ok) continue;
      const json = await res.json();
      const children = json?.data?.children || [];
      const texts = children.map(c => c?.data).filter(Boolean).map(d => `${d.title || ''} ${d.selftext || ''}`.trim()).filter(t => t.length > 0).slice(0, limit);
      if (texts.length > 0) return texts;
    } catch (err) {
      // wait jitter then retry
      await new Promise(r => setTimeout(r, 150 + Math.random()*200));
    }
  }
  return [];
}

async function getSentimentDetails(query, limit = 10) {
  const Sentiment = require('sentiment');
  const analyzer = new Sentiment();
  const texts = await fetchRedditPosts(query, limit);
  if (!texts || texts.length === 0) {
    return { score: null, positives: 0, negatives: 0, neutrals: 0, bullishPct: null, bearishPct: null, total: 0 };
  }
  let positives = 0, negatives = 0, neutrals = 0;
  const scores = texts.map(t => {
    const s = analyzer.analyze(t).score;
    if (s > 0) positives++; else if (s < 0) negatives++; else neutrals++;
    return s;
  });
  const total = scores.length;
  const sum = scores.reduce((a,b)=>a+b,0);
  let avg = sum / total;
  if (!Number.isFinite(avg)) avg = 0;
  if (avg > 1) avg = 1; else if (avg < -1) avg = -1;
  let bullishPct = total ? (positives / total) * 100 : null;
  let bearishPct = total ? (negatives / total) * 100 : null;
  if (bullishPct != null) bullishPct = Math.min(100, Math.max(0, bullishPct));
  if (bearishPct != null) bearishPct = Math.min(100, Math.max(0, bearishPct));
  return { score: avg, positives, negatives, neutrals, bullishPct, bearishPct, total };
}

// Backwards compatibility wrapper
async function getSentimentForQuery(query, limit = 10) {
  const d = await getSentimentDetails(query, limit);
  return d.score;
}

module.exports = { fetchRedditPosts, getSentimentForQuery, getSentimentDetails };
