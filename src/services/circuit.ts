import CircuitBreaker from 'opossum';

export function breaker<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const cb = new CircuitBreaker(fn, {
    timeout: 7000,
    errorThresholdPercentage: 60,
    volumeThreshold: 2,
    resetTimeout: 30000,
    rollingCountBuckets: 6,
    rollingCountTimeout: 120000,
  });
  return ((...args: Parameters<T>) => cb.fire(...args)) as T;
}
