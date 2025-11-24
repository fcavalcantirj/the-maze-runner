/**
 * Entity - Base class for all game entities
 */
export class Entity {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.active = true;
  }

  /**
   * Update entity (override in subclasses)
   */
  update(deltaTime) {
    // Override in subclasses
  }

  /**
   * Render entity (override in subclasses)
   */
  render(ctx, cellSize) {
    // Override in subclasses
  }

  /**
   * Get position
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Set position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Check if entity is active
   */
  isActive() {
    return this.active;
  }

  /**
   * Activate/deactivate entity
   */
  setActive(active) {
    this.active = active;
  }
}
