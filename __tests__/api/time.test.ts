import { getGreeting } from '@/lib/time';

describe('getGreeting()', () => {
  it('returns "Good morning" between midnight and noon', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T08:00:00'));
    expect(getGreeting()).toBe('Good morning');
    jest.useRealTimers();
  });

  it('returns "Good afternoon" between noon and 5pm', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T14:00:00'));
    expect(getGreeting()).toBe('Good afternoon');
    jest.useRealTimers();
  });

  it('returns "Good evening" after 5pm', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T19:00:00'));
    expect(getGreeting()).toBe('Good evening');
    jest.useRealTimers();
  });
});
