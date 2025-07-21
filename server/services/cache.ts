interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Auto-cleanup expired entries
    setTimeout(() => {
      this.cache.delete(key);
    }, ttlMinutes * 60 * 1000);
  }
  
  get<T>(key: string, ttlMinutes: number = 60): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const age = Date.now() - item.timestamp;
    const maxAge = ttlMinutes * 60 * 1000;
    
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  has(key: string, ttlMinutes: number = 60): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const age = Date.now() - item.timestamp;
    const maxAge = ttlMinutes * 60 * 1000;
    
    return age <= maxAge;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  getTimestamp(key: string): number | null {
    const item = this.cache.get(key);
    return item ? item.timestamp : null;
  }
}

export const cacheService = new CacheService();