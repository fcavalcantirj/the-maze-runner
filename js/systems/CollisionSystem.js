import { TOUCH_BUFFER } from '../utils/constants.js';

/**
 * CollisionSystem - Handles collision detection between player and maze walls
 */
export class CollisionSystem {
  constructor(mazeGenerator) {
    this.mazeGenerator = mazeGenerator;
  }

  /**
   * Check if position collides with a wall
   */
  isCollidingWithWall(x, y) {
    // Check the cell the player's center is in
    const gridX = Math.floor(x + 0.5);
    const gridY = Math.floor(y + 0.5);

    return this.mazeGenerator.isWall(gridX, gridY);
  }

  /**
   * Check if player can move to position
   */
  canMoveTo(x, y) {
    const { width, height } = this.mazeGenerator.getDimensions();

    // Check bounds
    if (x < 0.5 || x >= width - 0.5 || y < 0.5 || y >= height - 0.5) {
      return false;
    }

    // Check wall collision
    return !this.isCollidingWithWall(x, y);
  }

  /**
   * Get valid position nearest to target (with sliding collision)
   */
  getValidPosition(currentX, currentY, targetX, targetY) {
    // Try to move to target directly
    if (this.canMoveTo(targetX, targetY)) {
      return { x: targetX, y: targetY };
    }

    // Try sliding along X axis only
    if (this.canMoveTo(targetX, currentY)) {
      return { x: targetX, y: currentY };
    }

    // Try sliding along Y axis only
    if (this.canMoveTo(currentX, targetY)) {
      return { x: currentX, y: targetY };
    }

    // Can't move, stay at current position
    return { x: currentX, y: currentY };
  }

  /**
   * Check if position is at the exit
   */
  isAtExit(x, y, threshold = 0.3) {
    const exitPos = this.mazeGenerator.getExitPosition();
    const dx = Math.abs(x - exitPos.x);
    const dy = Math.abs(y - exitPos.y);
    return dx < threshold && dy < threshold;
  }

  /**
   * Update maze generator reference (for new levels)
   */
  setMaze(mazeGenerator) {
    this.mazeGenerator = mazeGenerator;
  }

  /**
   * Get distance to exit
   */
  getDistanceToExit(x, y) {
    const exitPos = this.mazeGenerator.getExitPosition();
    const dx = x - exitPos.x;
    const dy = y - exitPos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
