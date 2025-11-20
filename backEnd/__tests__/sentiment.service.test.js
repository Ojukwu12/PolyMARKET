const sentimentSvc = require('../src/services/sentiment.service');

test('analyzeTweetsAverage returns null for empty', () => {
  expect(sentimentSvc.analyzeTweetsAverage([])).toBeNull();
});

test('normalizeTo01 maps -1..1 to 0..1', () => {
  expect(sentimentSvc.normalizeTo01(-1)).toBeCloseTo(0);
  expect(sentimentSvc.normalizeTo01(0)).toBeCloseTo(0.5);
  expect(sentimentSvc.normalizeTo01(1)).toBeCloseTo(1);
});
