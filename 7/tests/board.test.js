import { jest } from '@jest/globals';
import { Board } from '../src/models/board.js';
import { Ship } from '../src/models/ship.js';
import { GAME_CONFIG } from '../src/config/game-config.js';

describe('Board', () => {
  let board;

  beforeEach(() => {
    board = new Board();
  });

  describe('Initialization', () => {
    it('should create a board of the correct size', () => {
      expect(board.size).toBe(GAME_CONFIG.BOARD_SIZE);
      expect(board.getGridCopy().length).toBe(GAME_CONFIG.BOARD_SIZE);
      expect(board.getGridCopy()[0].length).toBe(GAME_CONFIG.BOARD_SIZE);
    });

    it('should initialize the grid with water symbols', () => {
      const grid = board.getGridCopy();
      const isAllWater = grid.every(row => row.every(cell => cell === GAME_CONFIG.SYMBOLS.WATER));
      expect(isAllWater).toBe(true);
    });

    it('should have no ships initially', () => {
      expect(board.ships).toEqual([]);
    });
  });

  describe('Ship Placement', () => {
    it('should place a ship correctly on the board', () => {
      const ship = new Ship(['00', '01', '02']);
      const placed = board.placeShip(ship);
      expect(placed).toBe(true);
      expect(board.ships).toHaveLength(1);
      expect(board.ships[0]).toBe(ship);
    });

    it('should show a ship on the grid if requested', () => {
      const ship = new Ship(['11', '12']);
      board.placeShip(ship, true);
      expect(board.getSymbolAt(1, 1)).toBe(GAME_CONFIG.SYMBOLS.SHIP);
      expect(board.getSymbolAt(1, 2)).toBe(GAME_CONFIG.SYMBOLS.SHIP);
    });

    it('should not place a ship that collides with another', () => {
      const ship1 = new Ship(['00', '01']);
      const ship2 = new Ship(['01', '02']);
      board.placeShip(ship1);
      const placed = board.placeShip(ship2);
      expect(placed).toBe(false);
      expect(board.ships).toHaveLength(1);
    });

    it('should not place a ship that goes off the board', () => {
      const ship = new Ship(['98', '99', '910']); // '910' is invalid
      const placed = board.placeShip(ship);
      expect(placed).toBe(false);
      expect(board.ships).toHaveLength(0);
    });

    it('placeShipsRandomly should place the correct number of ships', () => {
      board.placeShipsRandomly(3, 3);
      expect(board.ships).toHaveLength(3);
      board.ships.forEach(ship => {
        expect(ship.length).toBe(3);
      });
    });
  });

  describe('Attack Processing', () => {
    let testShip;
    beforeEach(() => {
      testShip = new Ship(['55', '56']);
      board.placeShip(testShip);
    });

    it('should register a hit on a ship', () => {
      const result = board.processAttack('55');
      expect(result.hit).toBe(true);
      expect(result.ship).toBe(testShip);
      expect(board.getSymbolAt(5, 5)).toBe(GAME_CONFIG.SYMBOLS.HIT);
    });

    it('should register a miss', () => {
      const result = board.processAttack('00');
      expect(result.hit).toBe(false);
      expect(result.ship).toBeNull();
      expect(board.getSymbolAt(0, 0)).toBe(GAME_CONFIG.SYMBOLS.MISS);
    });

    it('should report a sunk ship', () => {
      board.processAttack('55');
      const result = board.processAttack('56');
      expect(result.sunk).toBe(true);
    });
  });

  describe('Game State', () => {
    beforeEach(() => {
        board.placeShip(new Ship(['00', '01']));
        board.placeShip(new Ship(['22', '32']));
    });

    it('getRemainingShipCount should return the correct count', () => {
        expect(board.getRemainingShipCount()).toBe(2);
        board.processAttack('00');
        board.processAttack('01');
        expect(board.getRemainingShipCount()).toBe(1);
    });

    it('areAllShipsSunk should be false if ships remain', () => {
        expect(board.areAllShipsSunk()).toBe(false);
    });

    it('areAllShipsSunk should be true when all ships are sunk', () => {
        board.processAttack('00');
        board.processAttack('01');
        board.processAttack('22');
        board.processAttack('32');
        expect(board.areAllShipsSunk()).toBe(true);
    });
  });

  describe('Reset', () => {
    it('should reset the board to its initial state', () => {
        board.placeShip(new Ship(['00']), true);
        board.processAttack('11');
        board.reset();
        expect(board.ships).toHaveLength(0);
        expect(board.getSymbolAt(0,0)).toBe(GAME_CONFIG.SYMBOLS.WATER);
        expect(board.getSymbolAt(1,1)).toBe(GAME_CONFIG.SYMBOLS.WATER);
    });
  });
}); 