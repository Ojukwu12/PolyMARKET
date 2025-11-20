const oddsService = require('../src/services/odds.service');

test('getHighestOutcomeProbability returns highest numeric probability', () => {
  const market = { outcomes: [ { name: 'A', prob: 0.2 }, { name: 'B', prob: 0.6 }, { name: 'C', prob: 0.15 } ] };
  const res = oddsService.getHighestOutcomeProbability(market);
  expect(res).toBeCloseTo(0.6);
});

test('getHighestOutcomeProbability tolerates mixed fields', () => {
  const market = { outcomes: [ { p: 0.1 }, { probability: 0.4 }, { prob: 0.3 } ] };
  const res = oddsService.getHighestOutcomeProbability(market);
  expect(res).toBeCloseTo(0.4);
});
