/**
 * Unit tests for getGreeting() in lib/time.ts
 * Repository: https://github.com/Nexus-GroupD/Nexus-Management
 */
import { getGreeting } from '@/lib/time';

describe('getGreeting()', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Good morning" between midnight and noon', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T08:00:00').getTime());
    expect(getGreeting()).toBe('Good morning');
  });

  it('returns "Good afternoon" between noon and 5pm', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T14:00:00').getTime());
    expect(getGreeting()).toBe('Good afternoon');
  });

  it('returns "Good evening" after 5pm', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T19:00:00').getTime());
    expect(getGreeting()).toBe('Good evening');
  });
});
