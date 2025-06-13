import { Player } from './player.js';
import { GAME_CONFIG } from '../config/game-config.js';

/**
 * AI Player class extending the base Player.
 * It encapsulates the CPU's game logic, including the "hunt" and "target" modes.
 */
export class AIPlayer extends Player {
  #mode;
  #targetQueue;

  constructor(name, board) {
    super(name, board);
    this.#mode = GAME_CONFIG.AI_MODES.HUNT;
    this.#targetQueue = [];
  }

  /**
   * Determines the AI's next move based on its current mode.
   * This is a corrected version that avoids infinite recursion.
   * @returns {string} The coordinate for the AI's next guess.
   */
  getNextMove() {
    // Prioritize target mode if the queue has valid targets
    while (this.#mode === GAME_CONFIG.AI_MODES.TARGET && this.#targetQueue.length > 0) {
      const nextTarget = this.#targetQueue.shift();
      if (!this.hasGuessed(nextTarget)) {
        return nextTarget; // Found a valid target
      }
    }

    // If target mode fails or isn't active, switch to hunt mode
    this.#mode = GAME_CONFIG.AI_MODES.HUNT;
    let coordinate;
    do {
      const guessRow = Math.floor(Math.random() * this.board.size);
      const guessCol = Math.floor(Math.random() * this.board.size);
      coordinate = `${guessRow}${guessCol}`;
    } while (this.hasGuessed(coordinate));
    
    return coordinate;
  }

  /**
   * Updates the AI's strategy based on the result of its last attack.
   * @param {object} attackResult - The result from the last `makeGuess` call.
   * @param {string} coordinate - The coordinate that was attacked.
   */
  processAttackResult(attackResult, coordinate) {
    if (attackResult.hit) {
      if (attackResult.sunk) {
        // If a ship is sunk, return to hunt mode and clear the queue
        this.#mode = GAME_CONFIG.AI_MODES.HUNT;
        this.#targetQueue = [];
      } else {
        // If it was a hit but not sunk, go into target mode
        this.#mode = GAME_CONFIG.AI_MODES.TARGET;
        // Add adjacent cells to the target queue
        const { row, col } = this.#parseCoordinate(coordinate);
        this.#enqueueAdjacent(row, col);
      }
    } else {
      // If it was a miss and the target queue is empty, return to hunt mode
      if (this.#targetQueue.length === 0) {
        this.#mode = GAME_CONFIG.AI_MODES.HUNT;
      }
    }
  }

  /**
   * Adds valid adjacent coordinates to the target queue.
   * @param {number} row - The row of the last hit.
   * @param {number} col - The column of the last hit.
   * @private
   */
  #enqueueAdjacent(row, col) {
    const adjacentCoords = [
      { r: row - 1, c: col }, // Up
      { r: row + 1, c: col }, // Down
      { r: row, c: col - 1 }, // Left
      { r: row, c: col + 1 }, // Right
    ];

    for (const { r, c } of adjacentCoords) {
      if (r >= 0 && r < this.board.size && c >= 0 && c < this.board.size) {
        const coordinate = `${r}${c}`;
        if (!this.hasGuessed(coordinate) && !this.#targetQueue.includes(coordinate)) {
          this.#targetQueue.push(coordinate);
        }
      }
    }
  }

  /**
   * Parses a coordinate string 'rc' into {row, col}.
   * This is a helper method to avoid duplicating logic.
   * @param {string} coordinate - Coordinate string.
   * @returns {{row: number, col: number}} Parsed coordinates.
   * @private
   */
  #parseCoordinate(coordinate) {
    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);
    return { row, col };
  }
} 