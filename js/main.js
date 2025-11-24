import { Game } from './core/Game.js';

/**
 * Main entry point
 */
function init() {
  const canvas = document.getElementById('game-canvas');

  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Create and initialize game
  const game = new Game(canvas);

  // Expose game instance for debugging
  window.game = game;

  console.log('The Maze Runner initialized!');
  console.log('Use WASD or Arrow keys to move, or drag with touch.');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
