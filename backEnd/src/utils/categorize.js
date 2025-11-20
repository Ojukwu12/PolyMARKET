// Keyword-based market categorization
const categories = [
  { name: 'AI', keywords: ['\\bai\\b', 'artificial intelligence', 'gpt', 'llm', 'chatgpt'] },
  { name: 'Crypto', keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cardano', 'solana', 'polkadot'] },
  { name: 'Politics', keywords: ['election', 'president', 'congress', 'senate', 'vote', 'vp', 'politics', 'candidate'] },
  { name: 'Tech', keywords: ['tech', 'startup', 'acquisition', 'acquire', 'ipo', 'apple', 'google', 'microsoft', 'meta'] },
  { name: 'Sports', keywords: ['\\bnba\\b','basketball','football','\\bnfl\\b','soccer','tennis','\\bufc\\b','\\bmma\\b','\\bmlb\\b','\\bnhl\\b'] },
  { name: 'Entertainment', keywords: ['movie','film','oscars','emmy','music','album','celebrity','tv show','series'] },
  { name: 'Finance', keywords: ['stock','stocks','sp500','s&p','dow','\\bmarket\\b','recession','inflation','\\bfed\\b'] }
];

function categorizeMarket(title) {
  if (!title) return 'Other';
  const t = title.toLowerCase();
  for (const c of categories) {
    for (const k of c.keywords) {
      // check if keyword is regex pattern (starts with \\b)
      if (k.startsWith('\\b')) {
        const re = new RegExp(k, 'i');
        if (re.test(t)) return c.name;
      } else {
        if (t.includes(k)) return c.name;
      }
    }
  }
  return 'Other';
}

module.exports = { categorizeMarket };
