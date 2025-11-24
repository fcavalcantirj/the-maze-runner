import {
  WALL_COLOR,
  PATH_COLOR,
  EXIT_COLOR,
  ENTRANCE_COLOR
} from '../utils/constants.js';
import { setupCanvas, gridToPixel } from '../utils/helpers.js';

/**
 * RenderSystem - Handles all canvas rendering
 */
export class RenderSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = null;
    this.cellSize = 20;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * Initialize rendering system
   */
  init(width, height) {
    this.ctx = setupCanvas(this.canvas, width, height);
    this.width = width;
    this.height = height;
  }

  /**
   * Clear canvas
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = PATH_COLOR;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Render maze walls using batch rendering
   */
  renderMaze(mazeGenerator) {
    if (!this.ctx) return;

    const { width, height } = mazeGenerator.getDimensions();

    // Calculate cell size to fit canvas
    const maxCellWidth = this.width / width;
    const maxCellHeight = this.height / height;
    this.cellSize = Math.min(maxCellWidth, maxCellHeight);

    // Center the maze
    this.offsetX = (this.width - width * this.cellSize) / 2;
    this.offsetY = (this.height - height * this.cellSize) / 2;

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    // Draw path background
    this.ctx.fillStyle = PATH_COLOR;
    this.ctx.fillRect(0, 0, width * this.cellSize, height * this.cellSize);

    // Batch render all walls
    this.ctx.fillStyle = WALL_COLOR;
    this.ctx.beginPath();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (mazeGenerator.isWall(x, y)) {
          this.ctx.rect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }

    this.ctx.fill();

    // Highlight exit cell with filled square and glow
    const exitPos = mazeGenerator.getExitPosition();
    const exitCenterX = exitPos.x * this.cellSize + this.cellSize / 2;
    const exitCenterY = exitPos.y * this.cellSize + this.cellSize / 2;
    const exitSize = this.cellSize * 0.6;

    this.ctx.save();
    this.ctx.shadowColor = EXIT_COLOR;
    this.ctx.shadowBlur = 20;
    this.ctx.fillStyle = EXIT_COLOR;
    this.ctx.fillRect(
      exitCenterX - exitSize / 2,
      exitCenterY - exitSize / 2,
      exitSize,
      exitSize
    );
    this.ctx.restore();

    this.ctx.restore();
  }

  /**
   * Render a marker (entrance or exit)
   */
  renderMarker(gridX, gridY, color, size) {
    const centerX = gridX * this.cellSize + this.cellSize / 2;
    const centerY = gridY * this.cellSize + this.cellSize / 2;
    const radius = this.cellSize * size;

    this.ctx.save();
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render player entity
   */
  renderPlayer(player) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    player.render(this.ctx, this.cellSize);
    this.ctx.restore();
  }

  /**
   * Render entities
   */
  renderEntities(entities) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);

    entities.forEach(entity => {
      if (entity.isActive()) {
        entity.render(this.ctx, this.cellSize);
      }
    });

    this.ctx.restore();
  }

  /**
   * Render debug info (FPS, grid, etc.)
   */
  renderDebug(fps) {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${fps}`, 10, 20);
    this.ctx.restore();
  }

  /**
   * Get cell size
   */
  getCellSize() {
    return this.cellSize;
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(screenX, screenY) {
    const gridX = (screenX - this.offsetX) / this.cellSize;
    const gridY = (screenY - this.offsetY) / this.cellSize;
    return { x: gridX, y: gridY };
  }

  /**
   * Convert grid coordinates to screen coordinates
   */
  gridToScreen(gridX, gridY) {
    const screenX = gridX * this.cellSize + this.offsetX;
    const screenY = gridY * this.cellSize + this.offsetY;
    return { x: screenX, y: screenY };
  }
}
