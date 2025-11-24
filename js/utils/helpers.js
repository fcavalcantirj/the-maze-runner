// Helper utility functions

/**
 * Linear interpolation between two values
 */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get difficulty parameters for a given level
 */
export function getDifficultyForLevel(level, tiers) {
  const tier = tiers.find(t => level >= t.levels[0] && level <= t.levels[1]);
  if (!tier) return tiers[tiers.length - 1]; // Return highest tier if beyond all

  // Calculate progress within tier (0 to 1)
  const tierProgress = (level - tier.levels[0]) / (tier.levels[1] - tier.levels[0]);

  // Interpolate maze size
  const mazeSize = Math.floor(
    lerp(tier.sizeRange[0], tier.sizeRange[1], tierProgress)
  );

  // Interpolate braiding percentage
  const braidingPercent = Math.floor(
    lerp(tier.braidingRange[0], tier.braidingRange[1], tierProgress)
  );

  // Select algorithm (rotate through available algorithms in tier)
  let algorithm;
  if (tier.algorithms[0] === 'all') {
    const allAlgorithms = ['prim', 'kruskal', 'huntandkill', 'wilson', 'growingtree'];
    algorithm = allAlgorithms[level % allAlgorithms.length];
  } else {
    algorithm = tier.algorithms[level % tier.algorithms.length];
  }

  return {
    tier: tier.name,
    mazeSize,
    braidingPercent,
    algorithm,
    level
  };
}

/**
 * Calculate score based on time and efficiency
 */
export function calculateScore(baseScore, timeBonus, moveEfficiency) {
  return Math.floor(baseScore + timeBonus + moveEfficiency);
}

/**
 * Format time in MM:SS format
 */
export function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get canvas with proper DPI scaling
 */
export function setupCanvas(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return ctx;
}

/**
 * Get touch/mouse position relative to canvas
 */
export function getInputPosition(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

/**
 * Check if two circles collide
 */
export function circleCollision(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Calculate distance between two points
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert grid coordinates to pixel coordinates
 */
export function gridToPixel(gridX, gridY, cellSize) {
  return {
    x: gridX * cellSize + cellSize / 2,
    y: gridY * cellSize + cellSize / 2
  };
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(pixelX, pixelY, cellSize) {
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize)
  };
}
