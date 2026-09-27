import { formatOffset, zonedWallTimeToUtc, zoneOffsetMinutes } from './timezone';

describe('time zones', () => {
  it('knows IST is UTC+5:30 year-round', () => {
    expect(zoneOffsetMinutes('Asia/Kolkata', Date.UTC(2026, 0, 1))).toBe(330);
    expect(zoneOffsetMinutes('Asia/Kolkata', Date.UTC(2026, 6, 1))).toBe(330);
    expect(formatOffset(330)).toBe('UTC+05:30');
    expect(formatOffset(-240)).toBe('UTC−04:00');
  });
  it('handles DST in New York', () => {
    expect(zoneOffsetMinutes('America/New_York', Date.UTC(2026, 0, 15))).toBe(-300);
    expect(zoneOffsetMinutes('America/New_York', Date.UTC(2026, 6, 15))).toBe(-240);
  });
  it('converts wall time to UTC', () => {
    expect(new Date(zonedWallTimeToUtc('2026-09-27T10:00', 'Asia/Kolkata')).toISOString()).toBe(
      '2026-09-27T04:30:00.000Z',
    );
    expect(new Date(zonedWallTimeToUtc('2026-07-04T09:00', 'America/New_York')).toISOString()).toBe(
      '2026-07-04T13:00:00.000Z',
    );
    expect(() => zonedWallTimeToUtc('bad', 'UTC')).toThrow();
    expect(() => zoneOffsetMinutes('Mars/Base', 0)).toThrow('Unknown time zone');
  });
});
