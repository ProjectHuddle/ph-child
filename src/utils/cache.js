/**
 * Cache Manager
 * 
 * Handles caching of API responses and application data
 * using localStorage with expiration support.
 * 
 * @package SureFeedback
 */

import { CACHE_CONFIG, ENVIRONMENT } from '../constants/api.js';

/**
 * Cache Manager class
 */
class CacheManager {
    constructor() {
        this.storage = null;
        this.prefix = 'surefeedback_';
        this.init();
    }

    /**
     * Initialize cache manager
     */
    init() {
        // Check if localStorage is available
        if (ENVIRONMENT.SUPPORTS_LOCAL_STORAGE) {
            try {
                // Test localStorage functionality
                const testKey = this.prefix + 'test';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                this.storage = localStorage;
            } catch (error) {
                this.storage = new MemoryStorage();
            }
        } else {
            this.storage = new MemoryStorage();
        }
    }

    /**
     * Generate cache key with prefix
     * @param {string} key 
     * @returns {string}
     */
    generateKey(key) {
        return this.prefix + key;
    }

    /**
     * Set cache item with expiration
     * @param {string} key 
     * @param {any} value 
     * @param {number} duration - Duration in milliseconds
     */
    set(key, value, duration = CACHE_CONFIG.DURATIONS.MEDIUM) {
        try {
            const item = {
                value,
                timestamp: Date.now(),
                expires: Date.now() + duration
            };

            this.storage.setItem(
                this.generateKey(key),
                JSON.stringify(item)
            );
        } catch (error) {
            // Error handled silently
        }
    }

    /**
     * Get cache item
     * @param {string} key 
     * @returns {any|null}
     */
    get(key) {
        try {
            const itemStr = this.storage.getItem(this.generateKey(key));
            if (!itemStr) {
                return null;
            }

            const item = JSON.parse(itemStr);
            
            // Check if item has expired
            if (Date.now() > item.expires) {
                this.delete(key);
                return null;
            }

            return item.value;
        } catch (error) {
            this.delete(key);
            return null;
        }
    }

    /**
     * Delete cache item
     * @param {string} key 
     */
    delete(key) {
        try {
            this.storage.removeItem(this.generateKey(key));
        } catch (error) {
            // Error handled silently
        }
    }

    /**
     * Check if cache item exists and is valid
     * @param {string} key 
     * @returns {boolean}
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Clear all cache items
     */
    clear() {
        try {
            if (this.storage === localStorage) {
                // For localStorage, remove only our items
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                // For memory storage, clear all
                this.storage.clear();
            }
        } catch (error) {
            // Error handled silently
        }
    }

    /**
     * Get cache statistics
     * @returns {Object}
     */
    getStats() {
        let totalItems = 0;
        let expiredItems = 0;
        let totalSize = 0;

        try {
            if (this.storage === localStorage) {
                const keys = Object.keys(localStorage);
                const ourKeys = keys.filter(key => key.startsWith(this.prefix));
                
                totalItems = ourKeys.length;

                ourKeys.forEach(key => {
                    try {
                        const itemStr = localStorage.getItem(key);
                        if (itemStr) {
                            totalSize += itemStr.length;
                            const item = JSON.parse(itemStr);
                            if (Date.now() > item.expires) {
                                expiredItems++;
                            }
                        }
                    } catch (error) {
                        // Invalid item, count as expired
                        expiredItems++;
                    }
                });
            } else {
                // Memory storage stats
                totalItems = this.storage.getStats().totalItems;
                expiredItems = this.storage.getStats().expiredItems;
                totalSize = this.storage.getStats().totalSize;
            }
        } catch (error) {
            // Error handled silently
        }

        return {
            totalItems,
            expiredItems,
            validItems: totalItems - expiredItems,
            totalSize,
            storageType: this.storage === localStorage ? 'localStorage' : 'memory'
        };
    }

    /**
     * Clean expired items
     */
    cleanup() {
        try {
            if (this.storage === localStorage) {
                const keys = Object.keys(localStorage);
                const ourKeys = keys.filter(key => key.startsWith(this.prefix));
                
                ourKeys.forEach(key => {
                    try {
                        const itemStr = localStorage.getItem(key);
                        if (itemStr) {
                            const item = JSON.parse(itemStr);
                            if (Date.now() > item.expires) {
                                localStorage.removeItem(key);
                            }
                        }
                    } catch (error) {
                        // Invalid item, remove it
                        localStorage.removeItem(key);
                    }
                });
            } else {
                this.storage.cleanup();
            }
        } catch (error) {
            // Error handled silently
        }
    }

    /**
     * Set cache item with callback to generate value if not exists
     * @param {string} key 
     * @param {Function} callback 
     * @param {number} duration 
     * @returns {Promise<any>}
     */
    async getOrSet(key, callback, duration = CACHE_CONFIG.DURATIONS.MEDIUM) {
        let value = this.get(key);
        
        if (value === null) {
            try {
                value = await callback();
                this.set(key, value, duration);
            } catch (error) {
                throw error;
            }
        }
        
        return value;
    }

    /**
     * Invalidate cache by pattern
     * @param {string} pattern 
     */
    invalidatePattern(pattern) {
        try {
            if (this.storage === localStorage) {
                const keys = Object.keys(localStorage);
                const regex = new RegExp(this.prefix + pattern);
                
                keys.forEach(key => {
                    if (regex.test(key)) {
                        localStorage.removeItem(key);
                    }
                });
            } else {
                this.storage.invalidatePattern(pattern);
            }
        } catch (error) {
            // Error handled silently
        }
    }
}

/**
 * Memory Storage implementation for fallback
 */
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }

    setItem(key, value) {
        this.data.set(key, value);
    }

    getItem(key) {
        return this.data.get(key) || null;
    }

    removeItem(key) {
        this.data.delete(key);
    }

    clear() {
        this.data.clear();
    }

    getStats() {
        let totalSize = 0;
        let expiredItems = 0;
        
        this.data.forEach(value => {
            totalSize += value.length;
            try {
                const item = JSON.parse(value);
                if (Date.now() > item.expires) {
                    expiredItems++;
                }
            } catch (error) {
                expiredItems++;
            }
        });

        return {
            totalItems: this.data.size,
            expiredItems,
            totalSize
        };
    }

    cleanup() {
        const expiredKeys = [];
        
        this.data.forEach((value, key) => {
            try {
                const item = JSON.parse(value);
                if (Date.now() > item.expires) {
                    expiredKeys.push(key);
                }
            } catch (error) {
                expiredKeys.push(key);
            }
        });

        expiredKeys.forEach(key => this.data.delete(key));
    }

    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        
        this.data.forEach((value, key) => {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.data.delete(key));
    }
}

// Create singleton instance
export const cacheManager = new CacheManager();

// Setup periodic cleanup
setInterval(() => {
    cacheManager.cleanup();
}, 5 * 60 * 1000); // Cleanup every 5 minutes

// Export for testing
export { CacheManager, MemoryStorage };