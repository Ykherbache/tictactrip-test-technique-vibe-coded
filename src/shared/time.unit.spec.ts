import { getUtcDayKey } from './time';

describe('getUtcDayKey', () => {
  it('returns YYYY-MM-DD in UTC', () => {
    const key = getUtcDayKey();
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
