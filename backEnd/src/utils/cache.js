// Simple in-memory TTL cache
class Cache {
  constructor() {
    this.map = new Map();
  }

  set(key, value, ttlSeconds = 60) {
    const expires = Date.now() + ttlSeconds * 1000;
    this.map.set(key, { value, expires });
  }

  get(key) {
    const data = this.map.get(key);
    if (!data) return null;
    if (Date.now() > data.expires) {
      this.map.delete(key);
      return null;
    }
    return data.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  del(key) {
    this.map.delete(key);
  }
}

module.exports = new Cache();
