// State Manager with Observer Pattern

/**
 * StateManager - Centralized game state with observer pattern
 * Components can subscribe to state changes and receive notifications
 */
export class StateManager {
  constructor() {
    this.state = {
      currentLevel: 1,
      score: 0,
      highScore: 0,
      lives: 3,
      gameState: 'menu', // menu, playing, paused, gameover
      playerPosition: { x: 0, y: 0 },
      moves: 0,
      levelStartTime: 0,
      totalPlayTime: 0,
      completedLevels: []
    };

    // Observers: key -> [callback functions]
    this.observers = {};
  }

  /**
   * Subscribe to state changes for a specific key
   * @param {string} key - State key to watch
   * @param {Function} callback - Called when key changes with (newValue, oldValue)
   */
  subscribe(key, callback) {
    if (!this.observers[key]) {
      this.observers[key] = [];
    }
    this.observers[key].push(callback);

    // Return unsubscribe function
    return () => {
      this.observers[key] = this.observers[key].filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all observers of a specific key
   */
  notify(key, newValue, oldValue) {
    if (this.observers[key]) {
      this.observers[key].forEach(callback => {
        callback(newValue, oldValue);
      });
    }
  }

  /**
   * Get state value
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Set state value (only notifies if value actually changed)
   */
  set(key, value) {
    const oldValue = this.state[key];

    // Deep comparison for objects
    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(value);

    if (hasChanged) {
      this.state[key] = value;
      this.notify(key, value, oldValue);
    }
  }

  /**
   * Update multiple state values at once
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Get entire state object
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Set entire state (useful for loading saves)
   */
  setState(newState) {
    Object.entries(newState).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Reset state to initial values
   */
  reset() {
    const highScore = this.state.highScore; // Preserve high score
    this.setState({
      currentLevel: 1,
      score: 0,
      highScore,
      lives: 3,
      gameState: 'menu',
      playerPosition: { x: 0, y: 0 },
      moves: 0,
      levelStartTime: 0,
      totalPlayTime: 0,
      completedLevels: []
    });
  }

  /**
   * Increment score
   */
  addScore(points) {
    const newScore = this.state.score + points;
    this.set('score', newScore);

    // Update high score if exceeded
    if (newScore > this.state.highScore) {
      this.set('highScore', newScore);
    }
  }

  /**
   * Advance to next level
   */
  nextLevel() {
    const currentLevel = this.state.currentLevel;
    this.state.completedLevels.push(currentLevel);
    this.set('completedLevels', [...this.state.completedLevels]);
    this.set('currentLevel', currentLevel + 1);
    this.set('moves', 0);
    this.set('levelStartTime', Date.now());
  }

  /**
   * Start new game
   */
  startNewGame() {
    this.reset();
    this.set('gameState', 'playing');
    this.set('levelStartTime', Date.now());
  }

  /**
   * Serialize state for saving
   */
  serialize() {
    return {
      ...this.state,
      savedAt: Date.now()
    };
  }

  /**
   * Deserialize state from save
   */
  deserialize(data) {
    if (!data) return false;

    this.setState(data);
    return true;
  }
}
