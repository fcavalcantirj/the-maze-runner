import { KEYBOARD_KEYS, TOUCH_DAMPENING } from '../utils/constants.js';

/**
 * InputSystem - Handles keyboard and touch input
 */
export class InputSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.touchActive = false;
    this.lastTouchPos = null;
    this.moveCallback = null;
    this.pauseCallback = null;

    this.setupKeyboard();
    this.setupTouch();
  }

  /**
   * Setup keyboard event listeners
   */
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);

      // Check for pause key
      if (KEYBOARD_KEYS.PAUSE.includes(e.key)) {
        if (this.pauseCallback) {
          this.pauseCallback();
        }
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key);
    });
  }

  /**
   * Setup touch event listeners with scroll/zoom prevention
   */
  setupTouch() {
    // Prevent default touch behaviors
    this.canvas.style.touchAction = 'none';

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchActive = true;
      this.handleTouchMove(e);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touchActive) {
        this.handleTouchMove(e);
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touchActive = false;
      this.lastTouchPos = null;
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.touchActive = false;
      this.lastTouchPos = null;
    }, { passive: false });

    // Prevent pinch-zoom gestures
    this.canvas.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  /**
   * Handle touch movement
   */
  handleTouchMove(event) {
    if (!this.moveCallback) return;

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Apply dampening for smoother movement
    if (this.lastTouchPos) {
      const dampX = this.lastTouchPos.x + (x - this.lastTouchPos.x) * TOUCH_DAMPENING;
      const dampY = this.lastTouchPos.y + (y - this.lastTouchPos.y) * TOUCH_DAMPENING;
      this.moveCallback(dampX, dampY);
      this.lastTouchPos = { x: dampX, y: dampY };
    } else {
      this.moveCallback(x, y);
      this.lastTouchPos = { x, y };
    }
  }

  /**
   * Get keyboard movement direction
   * Returns { x: -1/0/1, y: -1/0/1 }
   */
  getMovementDirection() {
    let dx = 0;
    let dy = 0;

    // Check UP
    if (KEYBOARD_KEYS.UP.some(key => this.keys.has(key))) {
      dy -= 1;
    }
    // Check DOWN
    if (KEYBOARD_KEYS.DOWN.some(key => this.keys.has(key))) {
      dy += 1;
    }
    // Check LEFT
    if (KEYBOARD_KEYS.LEFT.some(key => this.keys.has(key))) {
      dx -= 1;
    }
    // Check RIGHT
    if (KEYBOARD_KEYS.RIGHT.some(key => this.keys.has(key))) {
      dx += 1;
    }

    return { dx, dy };
  }

  /**
   * Set callback for movement input
   */
  onMove(callback) {
    this.moveCallback = callback;
  }

  /**
   * Set callback for pause input
   */
  onPause(callback) {
    this.pauseCallback = callback;
  }

  /**
   * Check if any movement key is pressed
   */
  hasMovementInput() {
    const { dx, dy } = this.getMovementDirection();
    return dx !== 0 || dy !== 0;
  }

  /**
   * Clear all input state
   */
  clear() {
    this.keys.clear();
    this.touchActive = false;
    this.lastTouchPos = null;
  }

  /**
   * Cleanup event listeners
   */
  destroy() {
    // Note: In a production app, we'd store references to bound functions
    // and remove specific listeners. For this game, we'll keep it simple.
    this.clear();
  }
}
