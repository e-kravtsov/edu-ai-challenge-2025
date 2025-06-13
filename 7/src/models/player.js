import { Board } from './board.js';
import { GAME_CONFIG, MESSAGES } from '../config/game-config.js';

/**
 * Base Player class representing a game participant.
 * This class abstracts player state and actions like making guesses.
 */
export class Player {
  #name;
  #board;
  #guesses;

  /**
   * Creates a new player instance.
   * @param {string} name - Player name.
   * @param {Board} board - The player's own board.
   */
  constructor(name, board) {
    if (!name || !board) {
      throw new Error('Player must have a name and a board.');
    }
    this.#name = name;
    this.#board = board;
    this.#guesses = new Set();
  }

  /**
   * Gets the player's name.
   * @returns {string} Player name.
   */
  get name() {
    return this.#name;
  }

  /**
   * Gets the player's board.
   * @returns {Board} The player's board instance.
   */
  get board() {
    return this.#board;
  }

  /**
   * Validates a coordinate string against the board and previous guesses.
   * @param {string} coordinate - Coordinate to validate.
   * @returns {{isValid: boolean, message?: string}} Validation result.
   */
  validateGuess(coordinate) {
    if (coordinate === null || coordinate.length !== 2) {
      return { isValid: false, message: MESSAGES.INPUT_INVALID_LENGTH };
    }

    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);

    if (isNaN(row) || isNaN(col) || row < 0 || row >= this.#board.size || col < 0 || col >= this.#board.size) {
      return { isValid: false, message: MESSAGES.INPUT_INVALID_RANGE(this.#board.size - 1) };
    }

    if (this.#guesses.has(coordinate)) {
      return { isValid: false, message: MESSAGES.INPUT_ALREADY_GUESSED };
    }

    return { isValid: true };
  }

  /**
   * Makes a guess on an opponent's board.
   * @param {string} coordinate - The coordinate to attack.
   * @param {Board} opponentBoard - The board to attack.
   * @returns {object} The result of the attack.
   */
  makeGuess(coordinate, opponentBoard) {
    if (this.#guesses.has(coordinate)) {
      // This case is for the AI, to prevent re-guessing known spots.
      // Human player validation is handled in the game loop.
      const { row, col } = this.#parseCoordinate(coordinate);
      const symbol = opponentBoard.getSymbolAt(row, col);
      if (symbol === GAME_CONFIG.SYMBOLS.HIT) {
        return { hit: true, sunk: false, wasAlreadyHit: true };
      }
    }
    
    this.#guesses.add(coordinate);
    return opponentBoard.processAttack(coordinate);
  }

  /**
   * Checks if a coordinate has already been guessed.
   * @param {string} coordinate - The coordinate to check.
   * @returns {boolean} True if the coordinate has been guessed.
   */
  hasGuessed(coordinate) {
    return this.#guesses.has(coordinate);
  }

  /**
   * Parses a coordinate string 'rc' into {row, col}.
   * @param {string} coordinate - Coordinate string (e.g., '34').
   * @returns {{row: number, col: number}} Parsed coordinates.
   * @private
   */
  #parseCoordinate(coordinate) {
    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);
    return { row, col };
  }
} 