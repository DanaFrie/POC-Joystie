// Client-side data cache to minimize Firebase queries
// Cache is cleared on page refresh and can be manually invalidated

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  /**
   * Get cached data if still valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Expired, remove from cache
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Singleton instance
export const dataCache = new DataCache();

// Cache key generators
export const cacheKeys = {
  challenge: (parentId: string) => `challenge:${parentId}`,
  challengeById: (challengeId: string) => `challengeById:${challengeId}`,
  user: (userId: string) => `user:${userId}`,
  child: (childId: string) => `child:${childId}`,
  uploads: (challengeId: string, parentId: string) => `uploads:${challengeId}:${parentId}`,
  dashboard: (userId: string) => `dashboard:${userId}`,
};

// Cache TTLs (in milliseconds)
export const cacheTTL = {
  challenge: 10 * 60 * 1000, // 10 minutes - challenge data rarely changes
  user: 30 * 60 * 1000, // 30 minutes - user data rarely changes
  child: 30 * 60 * 1000, // 30 minutes - child data rarely changes
  uploads: 1 * 60 * 1000, // 1 minute - uploads change more frequently
  dashboard: 2 * 60 * 1000, // 2 minutes - dashboard data changes moderately
};

