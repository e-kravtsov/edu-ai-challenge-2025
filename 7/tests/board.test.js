import { Board } from '../src/models/board.js';
import { Ship } from '../src/models/ship.js';
import { GAME_CONFIG } from '../src/config/game-config.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Constructor and Basic Properties', () => {
    test('should create a board with default size', () => {
      expect(board.size).toBe(GAME_CONFIG.BOARD_SIZE);
      expect(board.ships).toEqual([]);
      expect(board.guesses.size).toBe(0);
    });

    test('should create a board with custom size', () => {
      const customBoard = new Board(5);
      expect(customBoard.size).toBe(5);
    });

    test('should initialize grid with water symbols', () => {
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          expect(board.getSymbolAt(row, col)).toBe(GAME_CONFIG.SYMBOLS.WATER);
        }
      }
    });
  });

  describe('Grid Access', () => {
    test('should get symbol at valid coordinates', () => {
      expect(board.getSymbolAt(0, 0)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      expect(board.getSymbolAt(5, 5)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      expect(board.getSymbolAt(9, 9)).toBe(GAME_CONFIG.SYMBOLS.WATER);
    });

    test('should throw error for invalid coordinates', () => {
      expect(() => board.getSymbolAt(-1, 0)).toThrow('Invalid coordinate');
      expect(() => board.getSymbolAt(0, -1)).toThrow('Invalid coordinate');
      expect(() => board.getSymbolAt(10, 0)).toThrow('Invalid coordinate');
      expect(() => board.getSymbolAt(0, 10)).toThrow('Invalid coordinate');
    });

    test('should return grid copy', () => {
      const gridCopy = board.getGridCopy();
      
      // Modify the copy
      gridCopy[0][0] = 'X';
      
      // Original should be unchanged
      expect(board.getSymbolAt(0, 0)).toBe(GAME_CONFIG.SYMBOLS.WATER);
    });
  });

  describe('Ship Placement', () => {
    test('should place ship without showing it', () => {
      const ship = Ship.createShip(2, 3, 3, 'horizontal');
      const result = board.placeShip(ship, false);
      
      expect(result).toBe(true);
      expect(board.ships).toHaveLength(1);
      expect(board.ships[0]).toBe(ship);
      
      // Ship should not be visible on grid
      expect(board.getSymbolAt(2, 3)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      expect(board.getSymbolAt(2, 4)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      expect(board.getSymbolAt(2, 5)).toBe(GAME_CONFIG.SYMBOLS.WATER);
    });

    test('should place ship and show it on grid', () => {
      const ship = Ship.createShip(1, 1, 3, 'vertical');
      const result = board.placeShip(ship, true);
      
      expect(result).toBe(true);
      expect(board.ships).toHaveLength(1);
      
      // Ship should be visible on grid
      expect(board.getSymbolAt(1, 1)).toBe(GAME_CONFIG.SYMBOLS.SHIP);
      expect(board.getSymbolAt(2, 1)).toBe(GAME_CONFIG.SYMBOLS.SHIP);
      expect(board.getSymbolAt(3, 1)).toBe(GAME_CONFIG.SYMBOLS.SHIP);
    });

    test('should not place ship with invalid coordinates', () => {
      // Create a ship manually with coordinates that go out of bounds
      const ship = new Ship(['88', '89', '9:'], 'horizontal'); // '9:' has ASCII : (58) which is invalid
      const result = board.placeShip(ship, false);
      
      expect(result).toBe(false);
      expect(board.ships).toHaveLength(0);
    });

    test('should not place ship on occupied space', () => {
      const ship1 = Ship.createShip(0, 0, 3, 'horizontal');
      const ship2 = Ship.createShip(0, 1, 3, 'vertical'); // Overlaps at (0,1)
      
      board.placeShip(ship1, true);
      const result = board.placeShip(ship2, true);
      
      expect(result).toBe(false);
      expect(board.ships).toHaveLength(1);
    });

    test('should place multiple non-overlapping ships', () => {
      const ship1 = Ship.createShip(0, 0, 3, 'horizontal');
      const ship2 = Ship.createShip(2, 0, 3, 'vertical');
      
      const result1 = board.placeShip(ship1, true);
      const result2 = board.placeShip(ship2, true);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(board.ships).toHaveLength(2);
    });
  });

  describe('Random Ship Placement', () => {
    test('should place ships randomly', () => {
      const placedCount = board.placeShipsRandomly(3, 3, false);
      
      expect(placedCount).toBe(3);
      expect(board.ships).toHaveLength(3);
    });

    test('should show ships when requested', () => {
      board.placeShipsRandomly(1, 3, true);
      
      let shipSymbolCount = 0;
      for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
          if (board.getSymbolAt(row, col) === GAME_CONFIG.SYMBOLS.SHIP) {
            shipSymbolCount++;
          }
        }
      }
      
      expect(shipSymbolCount).toBe(3); // One ship of length 3
    });

    test('should handle impossible placement scenarios', () => {
      // Fill most of the board first, then try to place more ships
      board.placeShipsRandomly(15, 3, false);
      
      // Now try to place many more ships - should be impossible
      const placedCount = board.placeShipsRandomly(50, 4, false);
      
      expect(placedCount).toBeLessThan(50);
    });
  });

  describe('Attack Processing', () => {
    beforeEach(() => {
      // Place a test ship at known location
      const ship = Ship.createShip(5, 5, 3, 'horizontal');
      board.placeShip(ship, false);
    });

    test('should process hit on ship', () => {
      const result = board.processAttack('55');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.ship).toBeDefined();
      expect(board.getSymbolAt(5, 5)).toBe(GAME_CONFIG.SYMBOLS.HIT);
      expect(board.hasBeenGuessed('55')).toBe(true);
    });

    test('should process miss', () => {
      const result = board.processAttack('00');
      
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.ship).toBeNull();
      expect(board.getSymbolAt(0, 0)).toBe(GAME_CONFIG.SYMBOLS.MISS);
      expect(board.hasBeenGuessed('00')).toBe(true);
    });

    test('should detect sunk ship', () => {
      board.processAttack('55');
      board.processAttack('56');
      const result = board.processAttack('57');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.ship.isSunk()).toBe(true);
    });

    test('should throw error for duplicate guess', () => {
      board.processAttack('33');
      
      expect(() => board.processAttack('33')).toThrow('Coordinate already guessed');
    });

    test('should throw error for invalid coordinate format', () => {
      expect(() => board.processAttack('1')).toThrow('Invalid coordinate format');
      expect(() => board.processAttack('123')).toThrow('Invalid coordinate format');
      expect(() => board.processAttack('ab')).toThrow('Invalid coordinate values');
    });
  });

  describe('Game State Tracking', () => {
    beforeEach(() => {
      // Place two ships
      const ship1 = Ship.createShip(0, 0, 2, 'horizontal');
      const ship2 = Ship.createShip(2, 2, 2, 'vertical');
      board.placeShip(ship1, false);
      board.placeShip(ship2, false);
    });

    test('should track remaining ships', () => {
      expect(board.getRemainingShipCount()).toBe(2);
      
      // Sink first ship
      board.processAttack('00');
      board.processAttack('01');
      expect(board.getRemainingShipCount()).toBe(1);
      
      // Sink second ship
      board.processAttack('22');
      board.processAttack('32');
      expect(board.getRemainingShipCount()).toBe(0);
    });

    test('should detect when all ships are sunk', () => {
      expect(board.areAllShipsSunk()).toBe(false);
      
      // Sink all ships
      board.processAttack('00');
      board.processAttack('01');
      board.processAttack('22');
      board.processAttack('32');
      
      expect(board.areAllShipsSunk()).toBe(true);
    });

    test('should handle no ships case', () => {
      const emptyBoard = new Board();
      expect(emptyBoard.areAllShipsSunk()).toBe(false);
      expect(emptyBoard.getRemainingShipCount()).toBe(0);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      const ship = Ship.createShip(0, 0, 3, 'horizontal');
      board.placeShip(ship, false);
    });

    test('should calculate board statistics', () => {
      board.processAttack('00'); // Hit
      board.processAttack('11'); // Miss
      board.processAttack('01'); // Hit
      board.processAttack('22'); // Miss
      
      const stats = board.getStats();
      
      expect(stats.totalShips).toBe(1);
      expect(stats.sunkShips).toBe(0);
      expect(stats.remainingShips).toBe(1);
      expect(stats.totalHits).toBe(2);
      expect(stats.totalMisses).toBe(2);
      expect(stats.totalGuesses).toBe(4);
      expect(stats.accuracy).toBe('50.0');
    });

    test('should handle empty statistics', () => {
      const stats = board.getStats();
      
      expect(stats.totalShips).toBe(1);
      expect(stats.sunkShips).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.totalGuesses).toBe(0);
      expect(stats.accuracy).toBe('0');
    });
  });

  describe('Reset Functionality', () => {
    test('should reset board to initial state', () => {
      // Set up board state
      const ship = Ship.createShip(0, 0, 3, 'horizontal');
      board.placeShip(ship, true);
      board.processAttack('11');
      board.processAttack('00');
      
      // Reset
      board.reset();
      
      // Verify reset state
      expect(board.ships).toHaveLength(0);
      expect(board.guesses.size).toBe(0);
      expect(board.getSymbolAt(0, 0)).toBe(GAME_CONFIG.SYMBOLS.WATER);
      expect(board.getSymbolAt(1, 1)).toBe(GAME_CONFIG.SYMBOLS.WATER);
    });
  });

  describe('String Representation', () => {
    test('should create string representation with ships shown', () => {
      const ship = Ship.createShip(0, 0, 2, 'horizontal');
      board.placeShip(ship, true);
      board.processAttack('11'); // Miss
      board.processAttack('00'); // Hit
      
      const boardString = board.toString(true);
      
      expect(boardString).toContain('0 1');
      expect(boardString).toContain(GAME_CONFIG.SYMBOLS.HIT);
      expect(boardString).toContain(GAME_CONFIG.SYMBOLS.SHIP);
      expect(boardString).toContain(GAME_CONFIG.SYMBOLS.MISS);
    });

    test('should create string representation with ships hidden', () => {
      const ship = Ship.createShip(0, 0, 2, 'horizontal');
      board.placeShip(ship, true);
      board.processAttack('00'); // Hit
      
      const boardString = board.toString(false);
      
      expect(boardString).toContain(GAME_CONFIG.SYMBOLS.HIT);
      expect(boardString).not.toContain(GAME_CONFIG.SYMBOLS.SHIP);
    });
  });

  describe('Edge Cases', () => {
    test('should handle coordinate parsing edge cases', () => {
      expect(() => board.processAttack('')).toThrow();
      expect(() => board.processAttack(null)).toThrow();
      expect(() => board.processAttack(undefined)).toThrow();
    });

    test('should handle boundary coordinates', () => {
      const result1 = board.processAttack('00');
      const result2 = board.processAttack('99');
      
      expect(result1.hit).toBe(false);
      expect(result2.hit).toBe(false);
      expect(board.hasBeenGuessed('00')).toBe(true);
      expect(board.hasBeenGuessed('99')).toBe(true);
    });

    test('should maintain immutable guesses set', () => {
      board.processAttack('33');
      const guesses = board.guesses;
      
      guesses.add('44');
      
      expect(board.hasBeenGuessed('44')).toBe(false);
      expect(board.guesses.size).toBe(1);
    });
  });
}); 