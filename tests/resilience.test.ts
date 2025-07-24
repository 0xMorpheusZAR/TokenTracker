import { breaker } from '../src/services/circuit';
import { describe, it, expect } from 'vitest';

describe('circuit-breaker', () => {
  it('opens after consecutive failures', async () => {
    let calls = 0;
    const unstable = breaker(async () => {
      calls++;
      throw new Error('boom');
    });
    await expect(unstable()).rejects.toThrow();
    await expect(unstable()).rejects.toThrow();
    await expect(unstable()).rejects.toThrow('Breaker is open');
    expect(calls).toBe(2);
  });
});
