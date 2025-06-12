import { Ship } from './ship.js';
import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Board class representing the game board grid
 */
export class Board {
  #grid;
  #ships;
  #size;
  #guesses;

  /**
   * Creates a new board instance
   * @param {number} size - Board size (default from config)
   */
  constructor(size = GAME_CONFIG.BOARD_SIZE) {
    this.#size = size;
    this.#grid = this.#createEmptyGrid();
    this.#ships = [];
    this.#guesses = new Set();
  }

  /**
   * Gets the board size
   * @returns {number} Board size
   */
  get size() {
    return this.#size;
  }

  /**
   * Gets all ships on the board
   * @returns {Array<Ship>} Array of ships
   */
  get ships() {
    return [...this.#ships];
  }

  /**
   * Gets all guesses made on this board
   * @returns {Set<string>} Set of coordinate strings
   */
  get guesses() {
    return new Set(this.#guesses);
  }

  /**
   * Creates an empty grid filled with water symbols
   * @returns {Array<Array<string>>} 2D grid array
   * @private
   */
  #createEmptyGrid() {
    return Array(this.#size).fill(null).map(() => 
      Array(this.#size).fill(GAME_CONFIG.SYMBOLS.WATER)
    );
  }

  /**
   * Gets the symbol at a specific coordinate
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {string} Symbol at coordinate
   */
  getSymbolAt(row, col) {
    if (!this.#isValidCoordinate(row, col)) {
      throw new Error(`Invalid coordinate: ${row}, ${col}`);
    }
    return this.#grid[row][col];
  }

  /**
   * Validates if coordinates are within board bounds
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {boolean} True if valid
   * @private
   */
  #isValidCoordinate(row, col) {
    return row >= 0 && row < this.#size && col >= 0 && col < this.#size;
  }

  /**
   * Parses coordinate string to row and column
   * @param {string} coordinate - Coordinate string (e.g., '34')
   * @returns {{row: number, col: number}} Parsed coordinates
   * @private
   */
  #parseCoordinate(coordinate) {
    if (typeof coordinate !== 'string' || coordinate.length !== 2) {
      throw new Error('Invalid coordinate format');
    }
    
    const row = parseInt(coordinate[0], 10);
    const col = parseInt(coordinate[1], 10);
    
    if (isNaN(row) || isNaN(col)) {
      throw new Error('Invalid coordinate values');
    }
    
    return { row, col };
  }

  /**
   * Places a ship on the board
   * @param {Ship} ship - Ship to place
   * @param {boolean} showShip - Whether to show ship symbol on grid
   * @returns {boolean} True if placement successful
   */
  placeShip(ship, showShip = false) {
    // Check if all ship locations are valid and empty
    for (const location of ship.locations) {
      const { row, col } = this.#parseCoordinate(location);
      
      if (!this.#isValidCoordinate(row, col)) {
        return false;
      }
      
      if (this.#grid[row][col] !== GAME_CONFIG.SYMBOLS.WATER) {
        return false;
      }
    }

    // Place the ship
    this.#ships.push(ship);
    
    if (showShip) {
      for (const location of ship.locations) {
        const { row, col } = this.#parseCoordinate(location);
        this.#grid[row][col] = GAME_CONFIG.SYMBOLS.SHIP;
      }
    }
    
    return true;
  }

  /**
   * Places ships randomly on the board
   * @param {number} shipCount - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @param {boolean} showShips - Whether to show ships on grid
   * @returns {number} Number of ships successfully placed
   */
  placeShipsRandomly(shipCount, shipLength, showShips = false) {
    let placedCount = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    let attempts = 0;

    while (placedCount < shipCount && attempts < maxAttempts) {
      attempts++;
      
      const orientation = Math.random() < 0.5 ? 
        GAME_CONFIG.ORIENTATIONS.HORIZONTAL : 
        GAME_CONFIG.ORIENTATIONS.VERTICAL;
      
      let startRow, startCol;
      
      if (orientation === GAME_CONFIG.ORIENTATIONS.HORIZONTAL) {
        startRow = Math.floor(Math.random() * this.#size);
        startCol = Math.floor(Math.random() * (this.#size - shipLength + 1));
      } else {
        startRow = Math.floor(Math.random() * (this.#size - shipLength + 1));
        startCol = Math.floor(Math.random() * this.#size);
      }

      const ship = Ship.createShip(startRow, startCol, shipLength, orientation);
      
      if (this.placeShip(ship, showShips)) {
        placedCount++;
      }
    }

    return placedCount;
  }

  /**
   * Processes a guess/attack on the board
   * @param {string} coordinate - Coordinate string
   * @returns {{hit: boolean, sunk: boolean, ship: Ship|null}} Attack result
   */
  processAttack(coordinate) {
    if (this.#guesses.has(coordinate)) {
      throw new Error('Coordinate already guessed');
    }

    this.#guesses.add(coordinate);
    const { row, col } = this.#parseCoordinate(coordinate);

    // Find ship at this coordinate
    const targetShip = this.#ships.find(ship => ship.hasLocation(coordinate));

    if (targetShip) {
      // Hit!
      const wasAlreadyHit = targetShip.isHit(coordinate);
      if (wasAlreadyHit) {
        throw new Error('Location already hit');
      }

      targetShip.hit(coordinate);
      this.#grid[row][col] = GAME_CONFIG.SYMBOLS.HIT;
      
      return {
        hit: true,
        sunk: targetShip.isSunk(),
        ship: targetShip
      };
    } else {
      // Miss
      this.#grid[row][col] = GAME_CONFIG.SYMBOLS.MISS;
      return {
        hit: false,
        sunk: false,
        ship: null
      };
    }
  }

  /**
   * Checks if a coordinate has been guessed
   * @param {string} coordinate - Coordinate string
   * @returns {boolean} True if already guessed
   */
  hasBeenGuessed(coordinate) {
    return this.#guesses.has(coordinate);
  }

  /**
   * Gets the number of ships remaining (not sunk)
   * @returns {number} Number of ships not sunk
   */
  getRemainingShipCount() {
    return this.#ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Checks if all ships are sunk
   * @returns {boolean} True if all ships are sunk
   */
  areAllShipsSunk() {
    return this.#ships.length > 0 && this.#ships.every(ship => ship.isSunk());
  }

  /**
   * Gets a copy of the current grid for display
   * @returns {Array<Array<string>>} Copy of the grid
   */
  getGridCopy() {
    return this.#grid.map(row => [...row]);
  }

  /**
   * Resets the board to initial state
   */
  reset() {
    this.#grid = this.#createEmptyGrid();
    this.#ships = [];
    this.#guesses.clear();
  }

  /**
   * Gets board statistics
   * @returns {Object} Board statistics
   */
  getStats() {
    const totalShips = this.#ships.length;
    const sunkShips = this.#ships.filter(ship => ship.isSunk()).length;
    const totalHits = this.#ships.reduce((sum, ship) => sum + ship.getHitCount(), 0);
    const totalGuesses = this.#guesses.size;

    return {
      totalShips,
      sunkShips,
      remainingShips: totalShips - sunkShips,
      totalHits,
      totalMisses: totalGuesses - totalHits,
      totalGuesses,
      accuracy: totalGuesses > 0 ? (totalHits / totalGuesses * 100).toFixed(1) : '0'
    };
  }

  /**
   * Creates a display string for the board
   * @param {boolean} showShips - Whether to show ship positions
   * @returns {string} Board display string
   */
  toString(showShips = true) {
    let display = '  ';
    
    // Header row
    for (let i = 0; i < this.#size; i++) {
      display += `${i} `;
    }
    display += '\n';

    // Board rows
    for (let row = 0; row < this.#size; row++) {
      display += `${row} `;
      
      for (let col = 0; col < this.#size; col++) {
        let symbol = this.#grid[row][col];
        
        // Hide ships if showShips is false and it's not hit
        if (!showShips && symbol === GAME_CONFIG.SYMBOLS.SHIP) {
          symbol = GAME_CONFIG.SYMBOLS.WATER;
        }
        
        display += `${symbol} `;
      }
      display += '\n';
    }

    return display;
  }
} 