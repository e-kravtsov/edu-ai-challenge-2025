import { Player } from './player.js';
import { GAME_CONFIG, MESSAGES } from '../config/game-config.js';

/**
 * AI Player class with hunt and target strategies
 */
export class AIPlayer extends Player {
  #mode;
  #targetQueue;
  #lastHit;
  #shipDirection;

  /**
   * Creates a new AI player instance
   * @param {string} name - AI player name
   * @param {Board} board - AI's own board
   * @param {Board} targetBoard - Opponent's board to attack
   */
  constructor(name = 'CPU', board = null, targetBoard = null) {
    super(name, board, targetBoard);
    this.#mode = GAME_CONFIG.AI_MODES.HUNT;
    this.#targetQueue = [];
    this.#lastHit = null;
    this.#shipDirection = null;
  }

  /**
   * Gets current AI mode
   * @returns {string} Current AI mode
   */
  get mode() {
    return this.#mode;
  }

  /**
   * Gets the next move for the AI player
   * @returns {Promise<string>} Promise resolving to coordinate string
   */
  async getNextMove() {
    let coordinate;

    if (this.#mode === GAME_CONFIG.AI_MODES.TARGET && this.#targetQueue.length > 0) {
      coordinate = this.#getTargetModeMove();
    } else {
      coordinate = this.#getHuntModeMove();
      this.#mode = GAME_CONFIG.AI_MODES.HUNT;
    }

    return coordinate;
  }

  /**
   * Gets a move in hunt mode (random valid coordinate)
   * @returns {string} Coordinate string
   * @private
   */
  #getHuntModeMove() {
    let coordinate;
    const maxAttempts = 1000;
    let attempts = 0;

    do {
      const row = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      const col = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
      coordinate = `${row}${col}`;
      attempts++;
    } while (this.guesses.has(coordinate) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // Fallback: find any valid move
      coordinate = this.#findAnyValidMove();
    }

    return coordinate;
  }

  /**
   * Gets a move in target mode (from target queue)
   * @returns {string} Coordinate string
   * @private
   */
  #getTargetModeMove() {
    let coordinate;

    // Clean queue of already guessed coordinates
    this.#targetQueue = this.#targetQueue.filter(coord => !this.guesses.has(coord));

    if (this.#targetQueue.length === 0) {
      this.#mode = GAME_CONFIG.AI_MODES.HUNT;
      return this.#getHuntModeMove();
    }

    // If we know the direction, prioritize coordinates in that direction
    if (this.#shipDirection && this.#targetQueue.length > 1) {
      coordinate = this.#getBestDirectionalMove();
    } else {
      coordinate = this.#targetQueue.shift();
    }

    return coordinate;
  }

  /**
   * Gets the best move based on known ship direction
   * @returns {string} Coordinate string
   * @private
   */
  #getBestDirectionalMove() {
    if (!this.#lastHit || !this.#shipDirection) {
      return this.#targetQueue.shift();
    }

    const [lastRow, lastCol] = [
      parseInt(this.#lastHit[0], 10),
      parseInt(this.#lastHit[1], 10)
    ];

    // Find coordinates in the same direction
    const directionalMoves = this.#targetQueue.filter(coord => {
      const [row, col] = [parseInt(coord[0], 10), parseInt(coord[1], 10)];
      
      if (this.#shipDirection === 'horizontal') {
        return row === lastRow;
      } else {
        return col === lastCol;
      }
    });

    if (directionalMoves.length > 0) {
      const move = directionalMoves[0];
      this.#targetQueue = this.#targetQueue.filter(coord => coord !== move);
      return move;
    }

    return this.#targetQueue.shift();
  }

  /**
   * Finds any valid move (fallback method)
   * @returns {string} Coordinate string
   * @private
   */
  #findAnyValidMove() {
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
      for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        const coordinate = `${row}${col}`;
        if (!this.guesses.has(coordinate)) {
          return coordinate;
        }
      }
    }
    throw new Error('No valid moves available');
  }

  /**
   * Handles the result of an attack made by this AI
   * @param {Object} result - Attack result
   */
  onAttackResult(result) {
    const { coordinate, hit, sunk } = result.result;

    if (hit) {
      if (sunk) {
        // Ship sunk - return to hunt mode
        this.#mode = GAME_CONFIG.AI_MODES.HUNT;
        this.#targetQueue = [];
        this.#lastHit = null;
        this.#shipDirection = null;
      } else {
        // Hit but not sunk - switch to or continue target mode
        this.#mode = GAME_CONFIG.AI_MODES.TARGET;
        this.#updateTargetStrategy(coordinate);
      }
    } else {
      // Miss - if in target mode, continue targeting
      if (this.#mode === GAME_CONFIG.AI_MODES.TARGET && this.#targetQueue.length === 0) {
        this.#mode = GAME_CONFIG.AI_MODES.HUNT;
        this.#lastHit = null;
        this.#shipDirection = null;
      }
    }
  }

  /**
   * Updates the targeting strategy after a hit
   * @param {string} coordinate - Coordinate that was hit
   * @private
   */
  #updateTargetStrategy(coordinate) {
    const [row, col] = [parseInt(coordinate[0], 10), parseInt(coordinate[1], 10)];

    // If this is the first hit, add all adjacent coordinates
    if (!this.#lastHit) {
      this.#addAdjacentCoordinates(row, col);
      this.#lastHit = coordinate;
    } else {
      // Determine ship direction if not known
      if (!this.#shipDirection) {
        this.#determineShipDirection(coordinate);
      }

      // Add coordinates in the determined direction
      this.#addDirectionalCoordinates(row, col);
      this.#lastHit = coordinate;
    }
  }

  /**
   * Adds adjacent coordinates to the target queue
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @private
   */
  #addAdjacentCoordinates(row, col) {
    const adjacent = [
      { r: row - 1, c: col },     // Up
      { r: row + 1, c: col },     // Down
      { r: row, c: col - 1 },     // Left
      { r: row, c: col + 1 }      // Right
    ];

    for (const { r, c } of adjacent) {
      if (this.#isValidCoordinate(r, c)) {
        const coord = `${r}${c}`;
        if (!this.guesses.has(coord) && !this.#targetQueue.includes(coord)) {
          this.#targetQueue.push(coord);
        }
      }
    }
  }

  /**
   * Determines ship direction based on two hits
   * @param {string} currentHit - Current hit coordinate
   * @private
   */
  #determineShipDirection(currentHit) {
    if (!this.#lastHit) return;

    const [lastRow, lastCol] = [
      parseInt(this.#lastHit[0], 10),
      parseInt(this.#lastHit[1], 10)
    ];
    const [currentRow, currentCol] = [
      parseInt(currentHit[0], 10),
      parseInt(currentHit[1], 10)
    ];

    if (lastRow === currentRow) {
      this.#shipDirection = 'horizontal';
    } else if (lastCol === currentCol) {
      this.#shipDirection = 'vertical';
    }

    // Clear non-directional targets from queue
    if (this.#shipDirection) {
      this.#targetQueue = this.#targetQueue.filter(coord => {
        const [row, col] = [parseInt(coord[0], 10), parseInt(coord[1], 10)];
        
        if (this.#shipDirection === 'horizontal') {
          return row === currentRow;
        } else {
          return col === currentCol;
        }
      });
    }
  }

  /**
   * Adds coordinates in the determined ship direction
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @private
   */
  #addDirectionalCoordinates(row, col) {
    if (!this.#shipDirection) return;

    let coordsToAdd = [];

    if (this.#shipDirection === 'horizontal') {
      coordsToAdd = [
        { r: row, c: col - 1 },  // Left
        { r: row, c: col + 1 }   // Right
      ];
    } else {
      coordsToAdd = [
        { r: row - 1, c: col },  // Up
        { r: row + 1, c: col }   // Down
      ];
    }

    for (const { r, c } of coordsToAdd) {
      if (this.#isValidCoordinate(r, c)) {
        const coord = `${r}${c}`;
        if (!this.guesses.has(coord) && !this.#targetQueue.includes(coord)) {
          this.#targetQueue.push(coord);
        }
      }
    }
  }

  /**
   * Validates if coordinates are within board bounds
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} True if valid
   * @private
   */
  #isValidCoordinate(row, col) {
    return row >= 0 && row < GAME_CONFIG.BOARD_SIZE && 
           col >= 0 && col < GAME_CONFIG.BOARD_SIZE;
  }

  /**
   * Resets AI state
   */
  reset() {
    super.reset();
    this.#mode = GAME_CONFIG.AI_MODES.HUNT;
    this.#targetQueue = [];
    this.#lastHit = null;
    this.#shipDirection = null;
  }

  /**
   * Gets AI strategy information for debugging
   * @returns {Object} AI strategy info
   */
  getStrategyInfo() {
    return {
      mode: this.#mode,
      targetQueue: [...this.#targetQueue],
      lastHit: this.#lastHit,
      shipDirection: this.#shipDirection,
      queueLength: this.#targetQueue.length
    };
  }
} 