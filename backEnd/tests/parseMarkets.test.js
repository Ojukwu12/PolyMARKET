const parseMarkets = require('../src/utils/parseMarkets');

test('parseMarkets handles array', () => {
  const input = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' }];
  const out = parseMarkets(input);
  expect(Array.isArray(out)).toBe(true);
  expect(out.length).toBe(6);
  expect(out[0].id).toBe('a');
});

test('parseMarkets handles { markets: [] } shape', () => {
  const input = { markets: [{ id: 'x' }, { id: 'y' }] };
  const out = parseMarkets(input);
  expect(out.length).toBe(2);
  expect(out[0].id).toBe('x');
});

test('parseMarkets handles { data: [] } shape', () => {
  const input = { data: [{ id: 'd1' }] };
  const out = parseMarkets(input);
  expect(out.length).toBe(1);
  expect(out[0].id).toBe('d1');
});
