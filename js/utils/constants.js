// Game Configuration Constants

// Performance Targets
export const TARGET_FPS = 30;
export const FIXED_TIMESTEP = 1000 / 60; // 60 updates per second
export const MAX_FRAME_SKIP = 10; // Panic check threshold

// Canvas Settings
export const DEFAULT_CANVAS_WIDTH = 800;
export const DEFAULT_CANVAS_HEIGHT = 800;

// Player Settings
export const PLAYER_SPEED = 150; // pixels per second
export const PLAYER_SIZE = 0.3; // relative to cell size
export const PLAYER_COLOR = '#00ff88';

// Maze Colors
export const WALL_COLOR = '#2d3561';
export const PATH_COLOR = '#0f0f1e';
export const EXIT_COLOR = '#ffd700';
export const ENTRANCE_COLOR = '#00ff88';

// Difficulty Tiers Configuration
export const DIFFICULTY_TIERS = [
  {
    // Tier 1: Learning Phase (Levels 1-10)
    name: 'Learning',
    levels: [1, 10],
    algorithms: ['binary', 'sidewinder'],
    sizeRange: [15, 25],
    braidingRange: [0, 0],
    description: 'Predictable patterns help players learn mechanics'
  },
  {
    // Tier 2: Skill Building (Levels 11-25)
    name: 'Skill Building',
    levels: [11, 25],
    algorithms: ['prim', 'kruskal'],
    sizeRange: [25, 40],
    braidingRange: [0, 10],
    description: 'True branching without bias and multiple short paths'
  },
  {
    // Tier 3: Challenge (Levels 26-50)
    name: 'Challenge',
    levels: [26, 50],
    algorithms: ['huntandkill', 'growingtree'],
    sizeRange: [40, 60],
    braidingRange: [10, 25],
    description: 'Balanced corridors and branches with harder navigation'
  },
  {
    // Tier 4: Expert (Levels 51-100)
    name: 'Expert',
    levels: [51, 100],
    algorithms: ['wilson', 'growingtree_mixed'],
    sizeRange: [60, 80],
    braidingRange: [25, 50],
    description: 'Complex decision trees where loops make tracking difficult'
  },
  {
    // Tier 5: Master (Levels 101+)
    name: 'Master',
    levels: [101, Infinity],
    algorithms: ['all'],
    sizeRange: [80, 100],
    braidingRange: [50, 100],
    description: 'Maximum variety prevents pattern recognition'
  }
];

// Scoring Configuration
export const SCORE_BASE = 100;
export const SCORE_TIME_BONUS_MULTIPLIER = 10;
export const SCORE_MOVE_EFFICIENCY_MULTIPLIER = 5;

// Game States
export const GAME_STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover',
  LEVEL_TRANSITION: 'level_transition'
};

// Input Settings
export const KEYBOARD_KEYS = {
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  PAUSE: ['Escape', 'p', 'P']
};

// Touch Settings
export const TOUCH_BUFFER = 0.1; // Buffer zone around walls (fraction of cell size)
export const TOUCH_DAMPENING = 0.8; // Velocity smoothing factor

// Storage Keys
export const STORAGE_KEYS = {
  SAVE_GAME: 'maze_runner_save',
  HIGH_SCORE: 'maze_runner_high_score',
  SETTINGS: 'maze_runner_settings'
};

// Auto-save Settings
export const AUTOSAVE_DEBOUNCE_MS = 5000;
export const AUTOSAVE_INTERVAL_MS = 30000;

// Maze Generation Algorithms Map
export const ALGORITHM_MAP = {
  'binary': 'BinaryTree',
  'sidewinder': 'Sidewinder',
  'prim': 'Prim',
  'kruskal': 'Kruskal',
  'huntandkill': 'HuntAndKill',
  'growingtree': 'GrowingTree',
  'wilson': 'Wilson',
  'growingtree_mixed': 'GrowingTreeMixed'
};
