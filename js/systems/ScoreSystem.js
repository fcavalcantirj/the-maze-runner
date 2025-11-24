import {
  SCORE_BASE,
  SCORE_TIME_BONUS_MULTIPLIER,
  SCORE_MOVE_EFFICIENCY_MULTIPLIER
} from '../utils/constants.js';

/**
 * ScoreSystem - Calculates and manages scoring
 */
export class ScoreSystem {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Calculate score for level completion
   */
  calculateLevelScore(levelNumber, completionTimeMs, moves, mazeSize) {
    const baseScore = SCORE_BASE * levelNumber;

    // Time bonus (faster = more points)
    // Target: 1 second per cell, bonus for beating it
    const targetTime = mazeSize * mazeSize * 1000;
    const timeRatio = Math.max(0, (targetTime - completionTimeMs) / targetTime);
    const timeBonus = Math.floor(baseScore * timeRatio * SCORE_TIME_BONUS_MULTIPLIER);

    // Move efficiency bonus (fewer moves = more points)
    // Estimate optimal moves as roughly maze size * 1.5
    const estimatedOptimalMoves = mazeSize * 1.5;
    const moveRatio = Math.max(0, (estimatedOptimalMoves - moves) / estimatedOptimalMoves);
    const moveBonus = Math.floor(baseScore * moveRatio * SCORE_MOVE_EFFICIENCY_MULTIPLIER);

    // Total score
    const totalScore = Math.max(0, baseScore + timeBonus + moveBonus);

    return {
      total: totalScore,
      base: baseScore,
      timeBonus: Math.max(0, timeBonus),
      moveBonus: Math.max(0, moveBonus)
    };
  }

  /**
   * Award score for level completion
   */
  awardLevelCompletion(levelNumber, completionTimeMs, moves, mazeSize) {
    const scoreBreakdown = this.calculateLevelScore(
      levelNumber,
      completionTimeMs,
      moves,
      mazeSize
    );

    this.stateManager.addScore(scoreBreakdown.total);

    return scoreBreakdown;
  }

  /**
   * Get current score
   */
  getCurrentScore() {
    return this.stateManager.get('score');
  }

  /**
   * Get high score
   */
  getHighScore() {
    return this.stateManager.get('highScore');
  }

  /**
   * Check if current score is a new high score
   */
  isNewHighScore() {
    return this.getCurrentScore() > this.getHighScore();
  }
}
