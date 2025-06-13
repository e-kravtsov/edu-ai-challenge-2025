import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Ship class representing a battleship with its locations and hit status
 * Replaces legacy ship objects with proper encapsulation
 */
export class Ship {
  #locations;
  #hits;
  #length;
  #orientation;

  /**
   * Creates a new ship instance
   * @param {string[]} locations - Array of coordinate strings (e.g., ['00', '01', '02'])
   * @param {string} orientation - Ship orientation ('horizontal' or 'vertical')
   */
  constructor(locations = [], orientation = GAME_CONFIG.ORIENTATIONS.HORIZONTAL) {
    this.#locations = [...locations];
    this.#hits = new Array(locations.length).fill('');
    this.#length = locations.length;
    this.#orientation = orientation;
  }

  /**
   * Gets ship locations (immutable copy)
   * @returns {string[]} Array of coordinate strings
   */
  get locations() {
    return [...this.#locations];
  }

  /**
   * Gets ship hit status for each location (immutable copy)
   * @returns {string[]} Array of hit status ('hit' or '')
   */
  get hits() {
    return [...this.#hits];
  }

  /**
   * Gets ship length
   * @returns {number} Ship length
   */
  get length() {
    return this.#length;
  }

  /**
   * Gets ship orientation
   * @returns {string} Ship orientation
   */
  get orientation() {
    return this.#orientation;
  }

  /**
   * Checks if coordinate is part of this ship
   * @param {string} coordinate - Coordinate string (e.g., '34')
   * @returns {boolean} True if coordinate is part of ship
   */
  hasLocation(coordinate) {
    return this.#locations.includes(coordinate);
  }

  /**
   * Records a hit at the specified coordinate
   * @param {string} coordinate - Coordinate string
   * @returns {boolean} True if hit was successful, false if already hit or invalid
   */
  hit(coordinate) {
    const index = this.#locations.indexOf(coordinate);
    if (index === -1 || this.#hits[index] === 'hit') {
      return false;
    }
    
    this.#hits[index] = 'hit';
    return true;
  }

  /**
   * Checks if the ship is completely sunk
   * @returns {boolean} True if all locations are hit
   */
  isSunk() {
    return this.#hits.every(hit => hit === 'hit');
  }

  /**
   * Checks if a coordinate was already hit
   * @param {string} coordinate - Coordinate string
   * @returns {boolean} True if coordinate was already hit
   */
  isHit(coordinate) {
    const index = this.#locations.indexOf(coordinate);
    return index !== -1 && this.#hits[index] === 'hit';
  }

  /**
   * Gets the number of hits on this ship
   * @returns {number} Number of hits
   */
  getHitCount() {
    return this.#hits.filter(hit => hit === 'hit').length;
  }

  /**
   * Resets the ship to unhit state (useful for testing)
   */
  reset() {
    this.#hits.fill('');
  }

  /**
   * Factory method to create a ship from start position, length, and orientation
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} length - Ship length
   * @param {string} orientation - Ship orientation
   * @returns {Ship} New ship instance
   */
  static createShip(startRow, startCol, length, orientation) {
    const locations = [];
    
    for (let i = 0; i < length; i++) {
      const row = orientation === GAME_CONFIG.ORIENTATIONS.HORIZONTAL ? startRow : startRow + i;
      const col = orientation === GAME_CONFIG.ORIENTATIONS.HORIZONTAL ? startCol + i : startCol;
      locations.push(`${row}${col}`);
    }
    
    return new Ship(locations, orientation);
  }

  /**
   * Validates if a ship can be placed at the given position on a board
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} length - Ship length
   * @param {string} orientation - Ship orientation
   * @param {number} boardSize - Board size
   * @returns {boolean} True if placement is valid
   */
  static isValidPlacement(startRow, startCol, length, orientation, boardSize) {
    if (orientation === GAME_CONFIG.ORIENTATIONS.HORIZONTAL) {
      return startRow >= 0 && startRow < boardSize && 
             startCol >= 0 && startCol + length <= boardSize;
    } else {
      return startCol >= 0 && startCol < boardSize && 
             startRow >= 0 && startRow + length <= boardSize;
    }
  }

  /**
   * Converts ship to string representation for debugging
   * @returns {string} String representation
   */
  toString() {
    return `Ship(${this.#locations.join(',')}, ${this.#orientation}, hits: ${this.getHitCount()}/${this.#length})`;
  }
} 