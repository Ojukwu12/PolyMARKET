// __tests__/categorize.test.js
const { categorizeMarket } = require('../src/utils/categorize');

describe('categorizeMarket', () => {
  it('should return Crypto for bitcoin title', () => {
    expect(categorizeMarket('Will Bitcoin hit $100k?')).toBe('Crypto');
  });

  it('should return Politics for election title', () => {
    expect(categorizeMarket('Who will win the 2024 election?')).toBe('Politics');
  });

  it('should return AI for AI keywords', () => {
    expect(categorizeMarket('Will ChatGPT 5 be released?')).toBe('AI');
  });

  it('should return Sports for NBA keyword', () => {
    expect(categorizeMarket('Who wins the NBA finals?')).toBe('Sports');
  });

  it('should return Other for unrecognized title', () => {
    expect(categorizeMarket('Will it rain tomorrow?')).toBe('Other');
  });

  it('should return Other for empty title', () => {
    expect(categorizeMarket('')).toBe('Other');
  });
});
