/**
 * Level - Represents a maze level with metadata
 */
export class Level {
  constructor(mazeGenerator, levelNumber, difficulty) {
    this.mazeGenerator = mazeGenerator;
    this.levelNumber = levelNumber;
    this.difficulty = difficulty;
    this.startTime = Date.now();
    this.completionTime = null;
    this.completed = false;
  }

  /**
   * Get maze generator
   */
  getMaze() {
    return this.mazeGenerator;
  }

  /**
   * Mark level as completed
   */
  complete() {
    if (!this.completed) {
      this.completed = true;
      this.completionTime = Date.now() - this.startTime;
    }
  }

  /**
   * Get level metadata
   */
  getMetadata() {
    return {
      levelNumber: this.levelNumber,
      difficulty: this.difficulty,
      completed: this.completed,
      completionTime: this.completionTime,
      mazeSize: this.mazeGenerator.getDimensions()
    };
  }

  /**
   * Serialize level data
   */
  serialize() {
    return {
      levelNumber: this.levelNumber,
      difficulty: this.difficulty,
      completed: this.completed,
      completionTime: this.completionTime
    };
  }
}
