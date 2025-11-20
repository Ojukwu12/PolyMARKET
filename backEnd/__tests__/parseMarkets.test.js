const parseMarkets = require('../src/utils/parseMarkets');

test('parseMarkets handles array input and returns full list', () => {
  const arr = [1,2,3,4,5,6,7].map(n => ({ id: n }));
  const res = parseMarkets(arr);
  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBe(7);
});

test('parseMarkets handles object with markets field', () => {
  const obj = { markets: [{ id: 'a' }, { id: 'b' }] };
  const res = parseMarkets(obj);
  expect(res.length).toBe(2);
  expect(res[0].id).toBe('a');
});
