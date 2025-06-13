import { jest } from '@jest/globals';
import { Ship } from '../src/models/ship.js';
import { GAME_CONFIG } from '../src/config/game-config.js';

describe('Ship', () => {
  describe('Constructor', () => {
    it('should create a ship with specified locations and default orientation', () => {
      const locations = ['01', '02', '03'];
      const ship = new Ship(locations);
      expect(ship.locations).toEqual(locations);
      expect(ship.orientation).toBe(GAME_CONFIG.ORIENTATIONS.HORIZONTAL);
      expect(ship.length).toBe(3);
      expect(ship.hits).toEqual(['', '', '']);
    });

    it('should correctly set a vertical orientation', () => {
      const ship = new Ship(['10', '20'], GAME_CONFIG.ORIENTATIONS.VERTICAL);
      expect(ship.orientation).toBe(GAME_CONFIG.ORIENTATIONS.VERTICAL);
    });
  });

  describe('Getters', () => {
    it('should return immutable copies of locations and hits', () => {
      const ship = new Ship(['22', '23']);
      const locations = ship.locations;
      const hits = ship.hits;
      locations.push('24');
      hits[0] = 'hit';
      expect(ship.locations).toEqual(['22', '23']);
      expect(ship.hits).toEqual(['', '']);
    });
  });

  describe('hit()', () => {
    let ship;
    beforeEach(() => {
      ship = new Ship(['33', '34', '35']);
    });

    it('should register a hit on a valid location', () => {
      const result = ship.hit('34');
      expect(result).toBe(true);
      expect(ship.isHit('34')).toBe(true);
      expect(ship.getHitCount()).toBe(1);
    });

    it('should not register a hit on an invalid location', () => {
      const result = ship.hit('99');
      expect(result).toBe(false);
      expect(ship.getHitCount()).toBe(0);
    });

    it('should not register a hit on an already hit location', () => {
      ship.hit('33');
      const result = ship.hit('33');
      expect(result).toBe(false);
      expect(ship.getHitCount()).toBe(1);
    });
  });

  describe('isSunk()', () => {
    it('should not be sunk initially', () => {
      const ship = new Ship(['00', '10']);
      expect(ship.isSunk()).toBe(false);
    });

    it('should not be sunk if only partially hit', () => {
      const ship = new Ship(['00', '10']);
      ship.hit('00');
      expect(ship.isSunk()).toBe(false);
    });

    it('should be sunk when all locations are hit', () => {
      const ship = new Ship(['00', '10']);
      ship.hit('00');
      ship.hit('10');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('createShip should create a horizontal ship correctly', () => {
      const ship = Ship.createShip(1, 1, 3, GAME_CONFIG.ORIENTATIONS.HORIZONTAL);
      expect(ship.locations).toEqual(['11', '12', '13']);
      expect(ship.orientation).toBe(GAME_CONFIG.ORIENTATIONS.HORIZONTAL);
    });

    it('createShip should create a vertical ship correctly', () => {
      const ship = Ship.createShip(2, 2, 3, GAME_CONFIG.ORIENTATIONS.VERTICAL);
      expect(ship.locations).toEqual(['22', '32', '42']);
      expect(ship.orientation).toBe(GAME_CONFIG.ORIENTATIONS.VERTICAL);
    });

    it('isValidPlacement should return true for valid placements', () => {
      expect(Ship.isValidPlacement(0, 0, 3, 'horizontal', 10)).toBe(true);
      expect(Ship.isValidPlacement(7, 9, 3, 'vertical', 10)).toBe(true);
    });

    it('isValidPlacement should return false for invalid placements', () => {
      expect(Ship.isValidPlacement(0, 8, 3, 'horizontal', 10)).toBe(false);
      expect(Ship.isValidPlacement(8, 0, 3, 'vertical', 10)).toBe(false);
    });
  });

  describe('reset()', () => {
    it('should reset all hits', () => {
      const ship = new Ship(['55', '56']);
      ship.hit('55');
      ship.reset();
      expect(ship.getHitCount()).toBe(0);
      expect(ship.isHit('55')).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return a descriptive string', () => {
      const ship = new Ship(['77', '78']);
      ship.hit('77');
      const expectedString = 'Ship(77,78, horizontal, hits: 1/2)';
      expect(ship.toString()).toBe(expectedString);
    });
  });
}); 