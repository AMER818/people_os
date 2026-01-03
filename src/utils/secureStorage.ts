/**
 * SecureStorage Utility
 * 
 * Provides a wrapper around localStorage and sessionStorage with basic obfuscation (Base64).
 * NOTE: Base64 is NOT encryption. This is for obscurity only to prevent casual inspection.
 * Ideally, this should be replaced with Web Crypto API or a library like crypto-js.
 */

export type StorageType = 'local' | 'session';

class SecureStorage {
  private static instance: SecureStorage;
  private prefix: string = 'hzl_'; // Prefix to identify app keys

  private constructor() { }

  public static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Encodes value to Base64
   */
  private encrypt(value: string): string {
    try {
      return btoa(value);
    } catch (e) {
      console.error('Failed to encode value', e);
      return value;
    }
  }

  /**
   * Decodes value from Base64
   */
  private decrypt(value: string): string {
    try {
      return atob(value);
    } catch (e) {
      console.error('Failed to decode value', e);
      return value;
    }
  }

  /**
   * Set item in storage
   * @param key Key name
   * @param value String value to store
   * @param type 'local' or 'session' (default: 'session')
   */
  public setItem(key: string, value: string, type: StorageType = 'session'): void {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const encryptedValue = this.encrypt(value);
    storage.setItem(`${this.prefix}${key}`, encryptedValue);
  }

  /**
   * Get item from storage. Checks both local and session if type not specified,
   * prioritizing the specified type or session if generic.
   * @param key Key name
   * @param type Optional specific storage to check
   */
  public getItem(key: string, type?: StorageType): string | null {
    const prefixedKey = `${this.prefix}${key}`;

    // If type specified, check only that
    if (type) {
      const storage = type === 'local' ? localStorage : sessionStorage;
      const value = storage.getItem(prefixedKey);
      return value ? this.decrypt(value) : null;
    }

    // Otherwise check Session first, then Local
    const sessionVal = sessionStorage.getItem(prefixedKey);
    if (sessionVal) {return this.decrypt(sessionVal);}

    const localVal = localStorage.getItem(prefixedKey);
    if (localVal) {return this.decrypt(localVal);}

    return null;
  }

  /**
   * Remove item from both storages to be safe
   */
  public removeItem(key: string): void {
    const prefixedKey = `${this.prefix}${key}`;
    sessionStorage.removeItem(prefixedKey);
    localStorage.removeItem(prefixedKey);
  }

  /**
   * Clear all app-specific keys
   */
  public clear(): void {
    // We only clear keys starting with our prefix to avoid wiping other apps on localhost
    const toRemoveLocal: string[] = [];
    const toRemoveSession: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        toRemoveLocal.push(key);
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        toRemoveSession.push(key);
      }
    }

    toRemoveLocal.forEach(k => localStorage.removeItem(k));
    toRemoveSession.forEach(k => sessionStorage.removeItem(k));
  }
}

export const secureStorage = SecureStorage.getInstance();
