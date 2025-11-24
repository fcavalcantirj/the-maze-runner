// LocalStorage wrapper with error handling and versioning

const STORAGE_VERSION = 1;

/**
 * GameStorage - Handles save/load with LocalStorage
 */
export class GameStorage {
  constructor() {
    this.available = this.checkAvailability();
  }

  /**
   * Check if LocalStorage is available
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('LocalStorage not available:', e);
      return false;
    }
  }

  /**
   * Save data to LocalStorage
   */
  save(key, data) {
    if (!this.available) {
      console.warn('Cannot save: LocalStorage not available');
      return false;
    }

    try {
      const saveData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data
      };

      localStorage.setItem(key, JSON.stringify(saveData));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded');
      } else {
        console.error('Error saving to LocalStorage:', e);
      }
      return false;
    }
  }

  /**
   * Load data from LocalStorage
   */
  load(key) {
    if (!this.available) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const saveData = JSON.parse(item);

      // Check version compatibility
      if (saveData.version !== STORAGE_VERSION) {
        console.warn('Save data version mismatch, ignoring');
        return null;
      }

      return saveData.data;
    } catch (e) {
      console.error('Error loading from LocalStorage:', e);
      return null;
    }
  }

  /**
   * Remove data from LocalStorage
   */
  remove(key) {
    if (!this.available) return false;

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Error removing from LocalStorage:', e);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    if (!this.available) return false;

    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error clearing LocalStorage:', e);
      return false;
    }
  }

  /**
   * Check if a key exists
   */
  has(key) {
    if (!this.available) return false;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get timestamp of last save
   */
  getTimestamp(key) {
    if (!this.available) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const saveData = JSON.parse(item);
      return saveData.timestamp || null;
    } catch (e) {
      return null;
    }
  }
}

// Export singleton instance
export const storage = new GameStorage();
