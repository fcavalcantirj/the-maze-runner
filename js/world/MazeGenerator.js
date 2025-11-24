import * as ROT from 'rot-js';

/**
 * MazeGenerator - Wraps ROT.js maze generation and adds custom braiding
 */
export class MazeGenerator {
  constructor(width, height, algorithm = 'eller') {
    this.width = width;
    this.height = height;
    this.algorithm = algorithm;
    this.maze = new Map(); // Use Map for 'x,y' keys
    this.startPos = null;
    this.exitPos = null;
  }

  /**
   * Generate maze using ROT.js algorithm
   */
  generate() {
    this.maze.clear();

    // Seed ROT.js RNG for randomization with timestamp + random
    const seed = Date.now() + Math.floor(Math.random() * 1000000);
    console.log('Setting ROT.js seed:', seed);
    ROT.RNG.setSeed(seed);
    console.log('ROT.RNG state after seed:', ROT.RNG.getState());

    // Initialize all cells as walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setWall(x, y, true);
      }
    }

    // Use ROT.js to generate perfect maze
    let generator;

    switch (this.algorithm) {
      case 'eller':
        generator = new ROT.Map.EllerMaze(this.width, this.height);
        break;
      case 'icey':
        generator = new ROT.Map.IceyMaze(this.width, this.height, 0); // 0 = most random
        break;
      case 'divided':
        generator = new ROT.Map.DividedMaze(this.width, this.height);
        break;
      default:
        generator = new ROT.Map.DividedMaze(this.width, this.height); // Use DividedMaze which respects RNG
    }

    // ROT.js callback: 0 = passage, 1 = wall
    generator.create((x, y, value) => {
      this.setWall(x, y, value === 1);
    });

    // Set start and exit positions
    this.setStartAndExit();

    // Debug: count walls to verify maze changes
    let wallCount = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.isWall(x, y)) wallCount++;
      }
    }
    console.log(`Maze has ${wallCount} walls out of ${this.width * this.height} cells`);

    return this;
  }

  /**
   * Apply braiding algorithm to remove dead ends and create loops
   * @param {number} percentage - Percentage of dead ends to remove (0-100)
   */
  braid(percentage) {
    if (percentage <= 0) return this;

    const deadEnds = this.findAllDeadEnds();

    deadEnds.forEach(cell => {
      if (Math.random() * 100 < percentage) {
        const walledNeighbors = this.getWalledNeighbors(cell.x, cell.y);

        if (walledNeighbors.length > 0) {
          // Pick random walled neighbor and carve passage
          const target = walledNeighbors[Math.floor(Math.random() * walledNeighbors.length)];
          this.setWall(target.x, target.y, false);
        }
      }
    });

    return this;
  }

  /**
   * Find all dead ends (cells with only one passage)
   */
  findAllDeadEnds() {
    const deadEnds = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isWall(x, y) && this.isDeadEnd(x, y)) {
          deadEnds.push({ x, y });
        }
      }
    }

    return deadEnds;
  }

  /**
   * Check if a cell is a dead end (has only one passage neighbor)
   */
  isDeadEnd(x, y) {
    if (this.isWall(x, y)) return false;

    const passageNeighbors = this.getPassageNeighbors(x, y);
    return passageNeighbors.length === 1;
  }

  /**
   * Get neighbors that are passages
   */
  getPassageNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 },  // East
      { dx: 0, dy: 1 },  // South
      { dx: -1, dy: 0 }  // West
    ];

    directions.forEach(({ dx, dy }) => {
      const nx = x + dx;
      const ny = y + dy;

      if (this.isInBounds(nx, ny) && !this.isWall(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    });

    return neighbors;
  }

  /**
   * Get neighbors that are walls
   */
  getWalledNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // North
      { dx: 1, dy: 0 },  // East
      { dx: 0, dy: 1 },  // South
      { dx: -1, dy: 0 }  // West
    ];

    directions.forEach(({ dx, dy }) => {
      const nx = x + dx;
      const ny = y + dy;

      if (this.isInBounds(nx, ny) && this.isWall(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    });

    return neighbors;
  }

  /**
   * Set start and exit on maze edges with longest path between them
   * Combines topological analysis (longest path) with edge constraint (on walls)
   */
  setStartAndExit() {
    // Step 1: Find all walkable cells on or near the maze borders
    const borderCells = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isWall(x, y)) {
          // Check if cell is on or near a border (within 2 cells of edge)
          const nearLeft = x <= 1;
          const nearRight = x >= this.width - 2;
          const nearTop = y <= 1;
          const nearBottom = y >= this.height - 2;

          if (nearLeft || nearRight || nearTop || nearBottom) {
            borderCells.push({ x, y });
          }
        }
      }
    }

    if (borderCells.length < 2) {
      console.error('Not enough border cells found!');
      this.startPos = { x: 1, y: 1 };
      this.exitPos = { x: this.width - 2, y: this.height - 2 };
      return;
    }

    // Step 2: Find the pair of border cells with maximum path distance
    let maxPathDistance = 0;
    let bestStart = borderCells[0];
    let bestExit = borderCells[1];

    for (let i = 0; i < borderCells.length; i++) {
      const distances = this.calculateDistances(borderCells[i].x, borderCells[i].y);

      for (let j = i + 1; j < borderCells.length; j++) {
        const key = `${borderCells[j].x},${borderCells[j].y}`;
        const distance = distances.get(key);

        if (distance !== undefined && distance > maxPathDistance) {
          maxPathDistance = distance;
          bestStart = borderCells[i];
          bestExit = borderCells[j];
        }
      }
    }

    // Step 3: Assign start/exit based on position (top-left vs bottom-right)
    const startSum = bestStart.x + bestStart.y;
    const exitSum = bestExit.x + bestExit.y;

    if (startSum < exitSum) {
      this.startPos = bestStart;
      this.exitPos = bestExit;
    } else {
      this.startPos = bestExit;
      this.exitPos = bestStart;
    }

    console.log(`Start: (${this.startPos.x}, ${this.startPos.y}), Exit: (${this.exitPos.x}, ${this.exitPos.y}), Path: ${maxPathDistance} cells`);
  }

  /**
   * Calculate path distances from a starting position using BFS
   * Returns a Map of 'x,y' -> distance
   */
  calculateDistances(startX, startY) {
    const distances = new Map();
    const queue = [{ x: startX, y: startY, dist: 0 }];
    const startKey = `${startX},${startY}`;
    distances.set(startKey, 0);

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.getPassageNeighbors(current.x, current.y);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!distances.has(key)) {
          distances.set(key, current.dist + 1);
          queue.push({ x: neighbor.x, y: neighbor.y, dist: current.dist + 1 });
        }
      }
    }

    return distances;
  }

  /**
   * Check if position is a wall
   */
  isWall(x, y) {
    const key = `${x},${y}`;
    return this.maze.get(key) === true;
  }

  /**
   * Set wall state
   */
  setWall(x, y, isWall) {
    const key = `${x},${y}`;
    this.maze.set(key, isWall);
  }

  /**
   * Check if coordinates are in bounds
   */
  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get all walkable positions
   */
  getWalkablePositions() {
    const positions = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (!this.isWall(x, y)) {
          positions.push({ x, y });
        }
      }
    }

    return positions;
  }

  /**
   * Get start position
   */
  getStartPosition() {
    return { ...this.startPos };
  }

  /**
   * Get exit position
   */
  getExitPosition() {
    return { ...this.exitPos };
  }

  /**
   * Get maze dimensions
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }
}
