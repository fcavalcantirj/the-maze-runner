import { FIXED_TIMESTEP, MAX_FRAME_SKIP, TARGET_FPS } from '../utils/constants.js';

/**
 * GameLoop - Fixed timestep game loop using requestAnimationFrame
 * Separates update (fixed) from render (variable) for consistent gameplay
 */
export class GameLoop {
  constructor(updateCallback, renderCallback) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;

    // FPS tracking
    this.fps = TARGET_FPS;
    this.frameCount = 0;
    this.fpsTime = 0;

    // Bind loop method to preserve context
    this.loop = this.loop.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.fpsTime = this.lastTime;

    requestAnimationFrame(this.loop);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
  }

  /**
   * Main game loop with fixed timestep
   */
  loop(currentTime) {
    if (!this.running) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Accumulate time
    this.accumulator += deltaTime;

    // Panic check - prevent spiral of death
    // If we're too far behind, discard time and reset
    let updateSteps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && updateSteps < MAX_FRAME_SKIP) {
      // Fixed timestep update
      this.updateCallback(FIXED_TIMESTEP / 1000); // Convert to seconds
      this.accumulator -= FIXED_TIMESTEP;
      updateSteps++;
    }

    // If we hit the panic threshold, reset accumulator
    if (updateSteps >= MAX_FRAME_SKIP) {
      console.warn('Game loop panic: Discarding accumulated time');
      this.accumulator = 0;
    }

    // Calculate interpolation factor for smooth rendering
    const alpha = this.accumulator / FIXED_TIMESTEP;

    // Render with interpolation
    this.renderCallback(alpha);

    // Update FPS counter
    this.updateFPS(currentTime);

    // Continue loop
    requestAnimationFrame(this.loop);
  }

  /**
   * Update FPS counter
   */
  updateFPS(currentTime) {
    this.frameCount++;

    if (currentTime >= this.fpsTime + 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime = currentTime;
    }
  }

  /**
   * Get current FPS
   */
  getFPS() {
    return this.fps;
  }

  /**
   * Check if loop is running
   */
  isRunning() {
    return this.running;
  }
}
