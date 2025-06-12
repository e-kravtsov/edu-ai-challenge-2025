import { Board } from './board.js';
import { GAME_CONFIG, MESSAGES } from '../config/game-config.js';

/**
 * Base Player class representing a game player
 */
export class Player {
  #name;
  #board;
  #targetBoard;
  #guesses;

  /**
   * Creates a new player instance
   * @param {string} name - Player name
   * @param {Board} board - Player's own board
   * @param {Board} targetBoard - Opponent's board to attack
   */
  constructor(name, board = null, targetBoard = null) {
    this.#name = name;
    this.#board = board || new Board();
    this.#targetBoard = targetBoard;
    this.#guesses = new Set();
  }

  /**
   * Gets player name
   * @returns {string} Player name
   */
  get name() {
    return this.#name;
  }

  /**
   * Gets player's board
   * @returns {Board} Player's board
   */
  get board() {
    return this.#board;
  }

  /**
   * Gets target board (opponent's board)
   * @returns {Board} Target board
   */
  get targetBoard() {
    return this.#targetBoard;
  }

  /**
   * Sets the target board
   * @param {Board} board - Target board to set
   */
  setTargetBoard(board) {
    this.#targetBoard = board;
  }

  /**
   * Gets all guesses made by this player
   * @returns {Set<string>} Set of coordinate strings
   */
  get guesses() {
    return new Set(this.#guesses);
  }

  /**
   * Validates a coordinate string
   * @param {string} coordinate - Coordinate to validate
   * @returns {{valid: boolean, error?: string}} Validation result
   */
  validateCoordinate(coordinate) {
    if (!coordinate || typeof coordinate !== 'string') {
      return { 
        valid: false, 
        error: MESSAGES.INPUT_INVALID_LENGTH 
      };
    }

    if (coordinate.length !== 2) {
      return { 
        valid: false, 
        error: MESSAGES.INPUT_INVALID_LENGTH 
      };
    }

    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);

    if (isNaN(row) || isNaN(col)) {
      return { 
        valid: false, 
        error: MESSAGES.INPUT_INVALID_RANGE(GAME_CONFIG.BOARD_SIZE - 1)
      };
    }

    if (row < 0 || row >= GAME_CONFIG.BOARD_SIZE || 
        col < 0 || col >= GAME_CONFIG.BOARD_SIZE) {
      return { 
        valid: false, 
        error: MESSAGES.INPUT_INVALID_RANGE(GAME_CONFIG.BOARD_SIZE - 1)
      };
    }

    if (this.#guesses.has(coordinate)) {
      return { 
        valid: false, 
        error: MESSAGES.INPUT_ALREADY_GUESSED 
      };
    }

    return { valid: true };
  }

  /**
   * Makes a guess/attack on the target board
   * @param {string} coordinate - Coordinate to attack
   * @returns {{success: boolean, result?: Object, error?: string}} Attack result
   */
  makeGuess(coordinate) {
    if (!this.#targetBoard) {
      return { 
        success: false, 
        error: 'No target board set' 
      };
    }

    const validation = this.validateCoordinate(coordinate);
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error 
      };
    }

    try {
      this.#guesses.add(coordinate);
      const result = this.#targetBoard.processAttack(coordinate);
      
      return {
        success: true,
        result: {
          coordinate,
          hit: result.hit,
          sunk: result.sunk,
          ship: result.ship
        }
      };
    } catch (error) {
      this.#guesses.delete(coordinate); // Remove from guesses if attack failed
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Checks if the player has won (all opponent ships sunk)
   * @returns {boolean} True if player has won
   */
  hasWon() {
    return this.#targetBoard ? this.#targetBoard.areAllShipsSunk() : false;
  }

  /**
   * Checks if the player has lost (all own ships sunk)
   * @returns {boolean} True if player has lost
   */
  hasLost() {
    return this.#board.areAllShipsSunk();
  }

  /**
   * Gets the number of remaining ships on player's board
   * @returns {number} Number of remaining ships
   */
  getRemainingShips() {
    return this.#board.getRemainingShipCount();
  }

  /**
   * Gets the number of remaining opponent ships
   * @returns {number} Number of remaining opponent ships
   */
  getRemainingOpponentShips() {
    return this.#targetBoard ? this.#targetBoard.getRemainingShipCount() : 0;
  }

  /**
   * Sets up the player's board with ships
   * @param {number} shipCount - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @returns {boolean} True if setup successful
   */
  setupBoard(shipCount = GAME_CONFIG.SHIP_COUNT, shipLength = GAME_CONFIG.SHIP_LENGTH) {
    const placed = this.#board.placeShipsRandomly(shipCount, shipLength, true);
    return placed === shipCount;
  }

  /**
   * Gets player statistics
   * @returns {Object} Player statistics
   */
  getStats() {
    const boardStats = this.#board.getStats();
    const targetStats = this.#targetBoard ? this.#targetBoard.getStats() : null;

    return {
      name: this.#name,
      ownBoard: boardStats,
      attacks: {
        totalGuesses: this.#guesses.size,
        hits: targetStats ? targetStats.totalHits : 0,
        misses: targetStats ? targetStats.totalMisses : 0,
        accuracy: this.#guesses.size > 0 ? 
          ((targetStats ? targetStats.totalHits : 0) / this.#guesses.size * 100).toFixed(1) : 0
      }
    };
  }

  /**
   * Resets the player state
   */
  reset() {
    this.#board.reset();
    this.#guesses.clear();
  }

  /**
   * Gets the next move (to be overridden by subclasses)
   * @returns {Promise<string>} Promise resolving to coordinate string
   */
  async getNextMove() {
    throw new Error('getNextMove must be implemented by subclass');
  }

  /**
   * Handles attack result notification (can be overridden by subclasses)
   * @param {Object} result - Attack result
   */
  onAttackResult(result) {
    // Base implementation does nothing
    // Subclasses can override to handle specific logic
  }

  /**
   * Handles being attacked notification (can be overridden by subclasses)
   * @param {Object} result - Attack result on this player's board
   */
  onBeingAttacked(result) {
    // Base implementation does nothing
    // Subclasses can override to handle specific logic
  }
} 