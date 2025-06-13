import { Ship } from './ship.js';
import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Board class representing the game board, replacing legacy global board arrays.
 * It manages the grid, ship placement, and attack processing.
 */
export class Board {
  #grid;
  #ships;
  #size;

  /**
   * Creates a new board instance.
   * @param {number} size - Board size (default from config).
   */
  constructor(size = GAME_CONFIG.BOARD_SIZE) {
    this.#size = size;
    this.reset();
  }

  /**
   * Gets the board size.
   * @returns {number} Board size.
   */
  get size() {
    return this.#size;
  }

  /**
   * Gets all ships on the board (immutable copy).
   * @returns {Ship[]} Array of ships.
   */
  get ships() {
    return [...this.#ships];
  }

  /**
   * Creates an empty grid filled with water symbols.
   * @returns {string[][]} 2D grid array.
   * @private
   */
  #createEmptyGrid() {
    return Array(this.#size).fill(null).map(() =>
      Array(this.#size).fill(GAME_CONFIG.SYMBOLS.WATER)
    );
  }

  /**
   * Gets the symbol at a specific coordinate.
   * @param {number} row - Row index.
   * @param {number} col - Column index.
   * @returns {string} Symbol at the coordinate.
   */
  getSymbolAt(row, col) {
    if (!this.#isValidCoordinate(row, col, true)) { // Pass true to throw error
      // This line is technically unreachable if the above throws, but good for clarity
      throw new Error(`Invalid coordinate: ${row},${col}`);
    }
    return this.#grid[row][col];
  }

  /**
   * Validates if coordinates are within board bounds.
   * @param {number} row - Row index.
   * @param {number} col - Column index.
   * @param {boolean} throwOnError - Whether to throw an error on invalid coordinates.
   * @returns {boolean} True if valid.
   * @private
   */
  #isValidCoordinate(row, col, throwOnError = false) {
    const isValid = !(isNaN(row) || isNaN(col) || row < 0 || row >= this.#size || col < 0 || col >= this.#size);
    if (!isValid && throwOnError) {
        throw new Error(`Invalid coordinate: ${row},${col}`);
    }
    return isValid;
  }

  /**
   * Parses a coordinate string 'rc' into {row, col}.
   * @param {string} coordinate - Coordinate string (e.g., '34').
   * @returns {{row: number, col: number}} Parsed coordinates.
   * @private
   */
  #parseCoordinate(coordinate) {
    if (typeof coordinate !== 'string' || coordinate.length !== 2) {
      return { row: NaN, col: NaN }; // Return NaN for invalid format
    }
    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);
    return { row, col };
  }

  /**
   * Places a ship on the board.
   * @param {Ship} ship - Ship to place.
   * @param {boolean} showShipOnGrid - Whether to show the ship symbol on the grid.
   * @returns {boolean} True if placement was successful.
   */
  placeShip(ship, showShipOnGrid = false) {
    // First, check if all locations on the ship are individually valid and within bounds.
    for (const location of ship.locations) {
      const { row, col } = this.#parseCoordinate(location);
      if (!this.#isValidCoordinate(row, col)) {
        return false; // A location is malformed or out of bounds.
      }
    }

    // Second, check for collisions with already placed ships.
    const newLocations = new Set(ship.locations);
    for (const existingShip of this.#ships) {
      for (const existingLocation of existingShip.locations) {
        if (newLocations.has(existingLocation)) {
          return false; // Collision detected.
        }
      }
    }

    // If all checks pass, add the ship.
    this.#ships.push(ship);

    if (showShipOnGrid) {
      for (const location of ship.locations) {
        const { row, col } = this.#parseCoordinate(location);
        this.#grid[row][col] = GAME_CONFIG.SYMBOLS.SHIP;
      }
    }

    return true;
  }

  /**
   * Places ships randomly on the board, replicating legacy logic.
   * @param {number} shipCount - Number of ships to place.
   * @param {number} shipLength - Length of each ship.
   * @param {boolean} showShipsOnGrid - Whether to display ships on the grid after placement.
   */
  placeShipsRandomly(shipCount, shipLength, showShipsOnGrid = false) {
    let placedShips = 0;
    const maxAttempts = 1000; // Prevent infinite loop
    let attempts = 0;

    while (placedShips < shipCount && attempts < maxAttempts) {
      attempts++;
      const orientation = Math.random() < 0.5 ? GAME_CONFIG.ORIENTATIONS.HORIZONTAL : GAME_CONFIG.ORIENTATIONS.VERTICAL;
      let startRow, startCol;

      if (orientation === GAME_CONFIG.ORIENTATIONS.HORIZONTAL) {
        startRow = Math.floor(Math.random() * this.#size);
        startCol = Math.floor(Math.random() * (this.#size - shipLength + 1));
      } else {
        startRow = Math.floor(Math.random() * (this.#size - shipLength + 1));
        startCol = Math.floor(Math.random() * this.#size);
      }

      const newShip = Ship.createShip(startRow, startCol, shipLength, orientation);
      if (this.placeShip(newShip, showShipsOnGrid)) {
        placedShips++;
      }
    }
  }

  /**
   * Processes a guess/attack on the board.
   * @param {string} coordinate - Coordinate string.
   * @returns {{hit: boolean, sunk: boolean, ship: Ship | null}} Attack result.
   */
  processAttack(coordinate) {
    const { row, col } = this.#parseCoordinate(coordinate);

    for (const ship of this.#ships) {
      if (ship.hasLocation(coordinate)) {
        const wasAlreadyHit = ship.isHit(coordinate);
        ship.hit(coordinate);
        this.#grid[row][col] = GAME_CONFIG.SYMBOLS.HIT;
        return {
          hit: true,
          sunk: ship.isSunk(),
          ship,
          wasAlreadyHit
        };
      }
    }

    this.#grid[row][col] = GAME_CONFIG.SYMBOLS.MISS;
    return {
      hit: false,
      sunk: false,
      ship: null,
      wasAlreadyHit: false
    };
  }

  /**
   * Gets the number of ships remaining (not sunk).
   * @returns {number} Number of ships not yet sunk.
   */
  getRemainingShipCount() {
    return this.#ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Checks if all ships are sunk.
   * @returns {boolean} True if all ships are sunk.
   */
  areAllShipsSunk() {
    return this.#ships.length > 0 && this.getRemainingShipCount() === 0;
  }

  /**
   * Gets a copy of the current grid for display.
   * @returns {string[][]} Copy of the grid.
   */
  getGridCopy() {
    return this.#grid.map(row => [...row]);
  }

  /**
   * Resets the board to its initial state.
   */
  reset() {
    this.#grid = this.#createEmptyGrid();
    this.#ships = [];
  }
} 