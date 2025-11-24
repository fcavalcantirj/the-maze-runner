import { StateManager } from './StateManager.js';
import { GameLoop } from './GameLoop.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { MazeGenerator } from '../world/MazeGenerator.js';
import { Level } from '../world/Level.js';
import { Player } from '../entities/Player.js';
import {
  DIFFICULTY_TIERS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
  STORAGE_KEYS
} from '../utils/constants.js';
import { getDifficultyForLevel } from '../utils/helpers.js';
import { storage } from '../utils/storage.js';

/**
 * Game - Main game orchestrator
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;

    // Initialize core systems
    this.stateManager = new StateManager();
    this.renderSystem = new RenderSystem(canvas);
    this.inputSystem = new InputSystem(canvas);
    this.scoreSystem = new ScoreSystem(this.stateManager);

    // Game objects
    this.currentLevel = null;
    this.player = null;
    this.collisionSystem = null;
    this.levelCompleting = false;

    // Game loop
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha)
    );

    // UI elements
    this.setupUI();

    // Setup state observers
    this.setupStateObservers();

    // Setup input handlers
    this.setupInput();

    // Initialize rendering with viewport size, accounting for HUD elements
    this.resizeCanvas();

    // Load save data if exists
    this.loadGame();

    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Resize canvas to fit viewport, accounting for HUD elements and safe areas
   */
  resizeCanvas() {
    // Use the full viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Make canvas square, using the smaller dimension
    // Subtract small margin for safety (10px on each side)
    const size = Math.min(viewportWidth, viewportHeight) - 20;

    // Ensure minimum size for playability
    const finalSize = Math.max(size, 280);

    this.renderSystem.init(finalSize, finalSize);
  }

  /**
   * Setup UI element references
   */
  setupUI() {
    this.ui = {
      levelNumber: document.getElementById('level-number'),
      scoreNumber: document.getElementById('score-number'),
      highScore: document.getElementById('high-score'),
      finalLevel: document.getElementById('final-level'),
      finalScore: document.getElementById('final-score'),
      newHighscore: document.getElementById('new-highscore'),

      menu: document.getElementById('menu'),
      pauseScreen: document.getElementById('pause-screen'),
      gameoverScreen: document.getElementById('gameover-screen'),

      startBtn: document.getElementById('start-btn'),
      continueBtn: document.getElementById('continue-btn'),
      pauseBtn: document.getElementById('pause-btn'),
      resetBtn: document.getElementById('reset-btn'),
      resumeBtn: document.getElementById('resume-btn'),
      restartBtn: document.getElementById('restart-btn'),
      mainMenuBtn: document.getElementById('main-menu-btn'),
      retryBtn: document.getElementById('retry-btn'),
      menuBtn: document.getElementById('menu-btn')
    };

    // Setup button handlers
    this.ui.startBtn.addEventListener('click', () => this.startNewGame());
    this.ui.continueBtn.addEventListener('click', () => this.continueGame());
    this.ui.pauseBtn.addEventListener('click', () => this.pauseGame());
    this.ui.resetBtn.addEventListener('click', () => this.resetGame());
    this.ui.resumeBtn.addEventListener('click', () => this.resumeGame());
    this.ui.restartBtn.addEventListener('click', () => this.restartLevel());
    this.ui.mainMenuBtn.addEventListener('click', () => this.showMainMenu());
    this.ui.retryBtn.addEventListener('click', () => this.startNewGame());
    this.ui.menuBtn.addEventListener('click', () => this.showMainMenu());
  }

  /**
   * Setup state observers to update UI
   */
  setupStateObservers() {
    this.stateManager.subscribe('currentLevel', (level) => {
      this.ui.levelNumber.textContent = level;
    });

    this.stateManager.subscribe('score', (score) => {
      this.ui.scoreNumber.textContent = score;
    });

    this.stateManager.subscribe('highScore', (score) => {
      this.ui.highScore.textContent = score;
      this.saveHighScore();
    });

    this.stateManager.subscribe('gameState', (state) => {
      this.updateScreenVisibility(state);
    });
  }

  /**
   * Setup input handlers
   */
  setupInput() {
    // Touch input handler - tap to move one step
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.stateManager.get('gameState') !== 'playing') return;
      if (!this.player || !this.collisionSystem) return;

      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const screenX = touch.clientX - rect.left;
      const screenY = touch.clientY - rect.top;

      const gridPos = this.renderSystem.screenToGrid(screenX, screenY);
      const currentPos = this.player.getPosition();

      // Calculate direction to tap point
      const dx = gridPos.x - currentPos.x;
      const dy = gridPos.y - currentPos.y;

      // Determine primary direction (prioritize larger delta)
      let moveX = 0, moveY = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        moveX = dx > 0 ? 1 : -1;
      } else {
        moveY = dy > 0 ? 1 : -1;
      }

      // Try to move one cell in that direction
      const targetX = currentPos.x + moveX;
      const targetY = currentPos.y + moveY;

      if (this.collisionSystem.canMoveTo(targetX, targetY)) {
        this.player.moveTo(targetX, targetY);
      }
    }, { passive: false });

    // Pause handler
    this.inputSystem.onPause(() => {
      if (this.stateManager.get('gameState') === 'playing') {
        this.pauseGame();
      } else if (this.stateManager.get('gameState') === 'paused') {
        this.resumeGame();
      }
    });
  }

  /**
   * Start a new game
   */
  startNewGame() {
    this.stateManager.startNewGame();
    this.generateLevel(1);
    this.gameLoop.start();
  }

  /**
   * Reset game completely (clear save and restart from level 1)
   */
  resetGame() {
    // Clear saved game
    storage.remove(STORAGE_KEYS.SAVE_GAME);

    // Reset state
    this.stateManager.reset();
    this.stateManager.startNewGame();

    // Regenerate level 1
    this.generateLevel(1);

    // Restart game loop
    this.gameLoop.start();

    console.log('Game reset to level 1');
  }

  /**
   * Continue saved game
   */
  continueGame() {
    const currentLevel = this.stateManager.get('currentLevel');
    this.stateManager.set('gameState', 'playing');
    this.generateLevel(currentLevel);
    this.gameLoop.start();
  }

  /**
   * Generate a level
   */
  generateLevel(levelNumber) {
    try {
      const difficulty = getDifficultyForLevel(levelNumber, DIFFICULTY_TIERS);

      // Cap maze size at 60x60 to prevent performance issues
      const cappedSize = Math.min(difficulty.mazeSize, 60);

      console.log(`Generating level ${levelNumber}: ${cappedSize}x${cappedSize}, ${difficulty.braidingPercent}% braiding`);

      // Create maze generator (using 'divided' algorithm which respects RNG seeding)
      const mazeGen = new MazeGenerator(
        cappedSize,
        cappedSize,
        'divided'
      );

      mazeGen.generate().braid(difficulty.braidingPercent);

    // Create level
    this.currentLevel = new Level(mazeGen, levelNumber, difficulty);

    // Create collision system
    this.collisionSystem = new CollisionSystem(mazeGen);

    // Create/reset player at start position
    const startPos = mazeGen.getStartPosition();
    if (!this.player) {
      this.player = new Player(startPos.x, startPos.y);
    } else {
      this.player.setPosition(startPos.x, startPos.y);
      this.player.resetMoves();
    }

      // Update state
      this.stateManager.set('levelStartTime', Date.now());
    } catch (error) {
      console.error('Failed to generate level:', error);
      alert(`Error generating level ${levelNumber}. Restarting from level 1.`);
      this.resetGame();
    }
  }

  /**
   * Complete current level and move to next
   */
  completeLevel() {
    // Prevent multiple triggers
    if (this.levelCompleting) return;
    this.levelCompleting = true;

    this.currentLevel.complete();

    const levelNumber = this.stateManager.get('currentLevel');
    const completionTime = this.currentLevel.completionTime;
    const moves = this.player.getMoves();
    const mazeSize = this.currentLevel.getMaze().getDimensions().width;

    // Award score
    const scoreBreakdown = this.scoreSystem.awardLevelCompletion(
      levelNumber,
      completionTime,
      moves,
      mazeSize
    );

    console.log('Level completed!', scoreBreakdown);

    // Advance to next level
    this.stateManager.nextLevel();

    // Save game
    this.saveGame();

    // Small delay before generating next level
    setTimeout(() => {
      this.generateLevel(this.stateManager.get('currentLevel'));
      this.levelCompleting = false;
    }, 500);
  }

  /**
   * Restart current level
   */
  restartLevel() {
    const currentLevel = this.stateManager.get('currentLevel');
    this.generateLevel(currentLevel);
    this.resumeGame();
  }

  /**
   * Pause game
   */
  pauseGame() {
    this.stateManager.set('gameState', 'paused');
    this.gameLoop.stop();
  }

  /**
   * Resume game
   */
  resumeGame() {
    this.stateManager.set('gameState', 'playing');
    this.gameLoop.start();
  }

  /**
   * Show main menu
   */
  showMainMenu() {
    this.stateManager.set('gameState', 'menu');
    this.gameLoop.stop();
    this.saveGame();
  }

  /**
   * Game over
   */
  gameOver() {
    this.stateManager.set('gameState', 'gameover');
    this.gameLoop.stop();

    // Update game over UI
    this.ui.finalLevel.textContent = this.stateManager.get('currentLevel');
    this.ui.finalScore.textContent = this.stateManager.get('score');

    if (this.scoreSystem.isNewHighScore()) {
      this.ui.newHighscore.style.display = 'block';
    } else {
      this.ui.newHighscore.style.display = 'none';
    }

    this.saveGame();
  }

  /**
   * Update game state
   */
  update(deltaTime) {
    const gameState = this.stateManager.get('gameState');

    if (gameState !== 'playing') return;
    if (!this.player || !this.collisionSystem) return;

    // Handle keyboard input
    const movement = this.inputSystem.getMovementDirection();

    if (movement.dx !== 0 || movement.dy !== 0) {
      const currentPos = this.player.getPosition();
      const speed = deltaTime * 5;

      const targetX = currentPos.x + movement.dx * speed;
      const targetY = currentPos.y + movement.dy * speed;

      const validPos = this.collisionSystem.getValidPosition(
        currentPos.x,
        currentPos.y,
        targetX,
        targetY
      );

      this.player.moveTo(validPos.x, validPos.y);
    }

    // Update player
    this.player.update(deltaTime);

    // Check for level completion
    const playerPos = this.player.getPosition();
    if (this.collisionSystem.isAtExit(playerPos.x, playerPos.y)) {
      this.completeLevel();
    }
  }

  /**
   * Render game
   */
  render(alpha) {
    this.renderSystem.clear();

    if (this.currentLevel) {
      this.renderSystem.renderMaze(this.currentLevel.getMaze());
    }

    if (this.player) {
      this.renderSystem.renderPlayer(this.player);
    }

    // Debug FPS
    // this.renderSystem.renderDebug(this.gameLoop.getFPS());
  }

  /**
   * Update screen visibility based on game state
   */
  updateScreenVisibility(state) {
    // Hide all screens
    this.ui.menu.classList.remove('active');
    this.ui.pauseScreen.classList.remove('active');
    this.ui.gameoverScreen.classList.remove('active');

    // Show appropriate screen
    switch (state) {
      case 'menu':
        this.ui.menu.classList.add('active');
        break;
      case 'paused':
        this.ui.pauseScreen.classList.add('active');
        break;
      case 'gameover':
        this.ui.gameoverScreen.classList.add('active');
        break;
    }
  }

  /**
   * Save game state
   */
  saveGame() {
    const saveData = this.stateManager.serialize();
    storage.save(STORAGE_KEYS.SAVE_GAME, saveData);
  }

  /**
   * Load game state
   */
  loadGame() {
    const saveData = storage.load(STORAGE_KEYS.SAVE_GAME);

    if (saveData) {
      this.stateManager.deserialize(saveData);
      this.ui.continueBtn.style.display = 'block';
    } else {
      this.ui.continueBtn.style.display = 'none';
    }

    // Load high score separately
    const highScore = storage.load(STORAGE_KEYS.HIGH_SCORE);
    if (highScore !== null) {
      this.stateManager.set('highScore', highScore);
    }
  }

  /**
   * Save high score
   */
  saveHighScore() {
    const highScore = this.stateManager.get('highScore');
    storage.save(STORAGE_KEYS.HIGH_SCORE, highScore);
  }
}
