import { Entity } from './Entity.js';
import { PLAYER_SPEED, PLAYER_SIZE, PLAYER_COLOR } from '../utils/constants.js';
import { gridToPixel } from '../utils/helpers.js';

/**
 * Player - The player entity controlled by user input
 */
export class Player extends Entity {
  constructor(x, y) {
    super(x, y);

    this.targetX = x;
    this.targetY = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = PLAYER_SPEED;
    this.size = PLAYER_SIZE;
    this.color = PLAYER_COLOR;
    this.moves = 0;
  }

  /**
   * Update player position
   */
  update(deltaTime) {
    if (!this.active) return;

    // Move towards target position
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.01) {
      // Normalize and scale by speed and delta time
      const moveDistance = this.speed * deltaTime;
      const factor = Math.min(moveDistance / distance, 1);

      this.x += dx * factor;
      this.y += dy * factor;
    } else {
      // Snap to target if very close
      this.x = this.targetX;
      this.y = this.targetY;
    }
  }

  /**
   * Render player with enhanced glow effects
   */
  render(ctx, cellSize) {
    if (!this.active) return;

    const pixelPos = gridToPixel(this.x, this.y, cellSize);
    const radius = cellSize * this.size;

    ctx.save();

    // Outer glow ring
    const gradient = ctx.createRadialGradient(pixelPos.x, pixelPos.y, radius * 0.5, pixelPos.x, pixelPos.y, radius * 2.5);
    gradient.addColorStop(0, 'rgba(0, 255, 136, 0.5)');
    gradient.addColorStop(0.4, 'rgba(0, 255, 136, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pixelPos.x, pixelPos.y, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Main player circle with strong glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(pixelPos.x, pixelPos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight for 3D effect
    const highlightGradient = ctx.createRadialGradient(
      pixelPos.x - radius * 0.3,
      pixelPos.y - radius * 0.3,
      0,
      pixelPos.x,
      pixelPos.y,
      radius
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.shadowBlur = 0;
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(pixelPos.x, pixelPos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Set target position for movement
   */
  moveTo(x, y) {
    // Only count as move if position actually changed
    if (Math.floor(x) !== Math.floor(this.targetX) ||
        Math.floor(y) !== Math.floor(this.targetY)) {
      this.moves++;
    }

    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set position immediately (no smooth movement)
   */
  setPosition(x, y) {
    super.setPosition(x, y);
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Get grid position (rounded to nearest cell)
   */
  getGridPosition() {
    return {
      x: Math.floor(this.x),
      y: Math.floor(this.y)
    };
  }

  /**
   * Get number of moves
   */
  getMoves() {
    return this.moves;
  }

  /**
   * Reset moves counter
   */
  resetMoves() {
    this.moves = 0;
  }
}
