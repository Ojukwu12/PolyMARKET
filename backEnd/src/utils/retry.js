// Simple retry with exponential backoff
async function retry(fn, options = {}) {
  const retries = options.retries || 3;
  const minDelay = options.minDelay || 200; // ms
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = minDelay * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

module.exports = retry;
