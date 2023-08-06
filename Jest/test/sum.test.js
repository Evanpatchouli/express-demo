const { sum } = require('../src/utils');

describe('test demo', () => {
  test('sum test', () => {
    expect(sum(1, 2)).toBe(3);
  })
})