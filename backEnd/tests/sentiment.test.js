const sentimentService = require('../src/services/sentiment.service');

test('normalizeTo01 maps -1 -> 0 and 1 -> 1', () => {
  expect(sentimentService.normalizeTo01(-1)).toBe(0);
  expect(sentimentService.normalizeTo01(1)).toBe(1);
});

test('analyzeTweetsAverage returns null for empty array', () => {
  expect(sentimentService.analyzeTweetsAverage([])).toBeNull();
});
