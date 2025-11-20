const odds = require('../src/services/odds.service');

test('getOddsFromMarket finds lastTradePrice and others', () => {
  expect(odds.getOddsFromMarket({ lastTradePrice: 0.5 })).toBe(0.5);
  expect(odds.getOddsFromMarket({ lastPrice: 0.6 })).toBe(0.6);
  expect(odds.getOddsFromMarket({ probability: 0.7 })).toBe(0.7);
});

test('getHighestOutcomeProbability finds max probability', () => {
  const m = { outcomes: [{ probability: 0.2 }, { prob: 0.8 }, { price: 0.6 }] };
  expect(odds.getHighestOutcomeProbability(m)).toBe(0.8);
});
