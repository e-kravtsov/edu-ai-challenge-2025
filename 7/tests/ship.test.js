import { Ship } from '../src/models/ship.js';

describe('Ship', () => {
  describe('Constructor', () => {
    test('should create a ship with given locations and orientation', () => {
      const locations = ['00', '01', '02'];
      const ship = new Ship(locations, 'horizontal');
      
      expect(ship.locations).toEqual(locations);
      expect(ship.orientation).toBe('horizontal');
      expect(ship.length).toBe(3);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should create a ship with default orientation', () => {
      const locations = ['00', '10', '20'];
      const ship = new Ship(locations);
      
      expect(ship.orientation).toBe('horizontal');
    });

    test('should create empty ship with defaults', () => {
      const ship = new Ship();
      
      expect(ship.locations).toEqual([]);
      expect(ship.orientation).toBe('horizontal');
      expect(ship.length).toBe(0);
      expect(ship.hits).toEqual([]);
    });
  });

  describe('Location Management', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['23', '24', '25'], 'horizontal');
    });

    test('should check if coordinate is part of ship', () => {
      expect(ship.hasLocation('23')).toBe(true);
      expect(ship.hasLocation('24')).toBe(true);
      expect(ship.hasLocation('25')).toBe(true);
      expect(ship.hasLocation('26')).toBe(false);
      expect(ship.hasLocation('33')).toBe(false);
    });

    test('should return immutable copies of locations and hits', () => {
      const locations = ship.locations;
      const hits = ship.hits;
      
      locations.push('99');
      hits.push(true);
      
      expect(ship.locations).toEqual(['23', '24', '25']);
      expect(ship.hits).toEqual([false, false, false]);
    });
  });

  describe('Hit Management', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['10', '11', '12'], 'horizontal');
    });

    test('should record hit at valid coordinate', () => {
      const result = ship.hit('11');
      
      expect(result).toBe(true);
      expect(ship.isHit('11')).toBe(true);
      expect(ship.hits).toEqual([false, true, false]);
      expect(ship.getHitCount()).toBe(1);
    });

    test('should not record hit at invalid coordinate', () => {
      const result = ship.hit('99');
      
      expect(result).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
      expect(ship.getHitCount()).toBe(0);
    });

    test('should not record hit at already hit coordinate', () => {
      ship.hit('10');
      const result = ship.hit('10');
      
      expect(result).toBe(false);
      expect(ship.hits).toEqual([true, false, false]);
      expect(ship.getHitCount()).toBe(1);
    });

    test('should check if coordinate was already hit', () => {
      expect(ship.isHit('10')).toBe(false);
      
      ship.hit('10');
      expect(ship.isHit('10')).toBe(true);
      expect(ship.isHit('11')).toBe(false);
    });

    test('should count total hits correctly', () => {
      expect(ship.getHitCount()).toBe(0);
      
      ship.hit('10');
      expect(ship.getHitCount()).toBe(1);
      
      ship.hit('11');
      expect(ship.getHitCount()).toBe(2);
      
      ship.hit('10'); // Already hit
      expect(ship.getHitCount()).toBe(2);
    });
  });

  describe('Sunk Status', () => {
    let ship;

    beforeEach(() => {
      ship = new Ship(['30', '31'], 'horizontal');
    });

    test('should not be sunk initially', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should not be sunk with partial hits', () => {
      ship.hit('30');
      expect(ship.isSunk()).toBe(false);
    });

    test('should be sunk when all locations are hit', () => {
      ship.hit('30');
      ship.hit('31');
      expect(ship.isSunk()).toBe(true);
    });

    test('should handle single-location ship', () => {
      const singleShip = new Ship(['55']);
      
      expect(singleShip.isSunk()).toBe(false);
      singleShip.hit('55');
      expect(singleShip.isSunk()).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset ship to unhit state', () => {
      const ship = new Ship(['40', '41', '42']);
      
      ship.hit('40');
      ship.hit('42');
      expect(ship.getHitCount()).toBe(2);
      expect(ship.isSunk()).toBe(false);
      
      ship.reset();
      expect(ship.getHitCount()).toBe(0);
      expect(ship.isSunk()).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });
  });

  describe('Static Factory Methods', () => {
    describe('createShip', () => {
      test('should create horizontal ship correctly', () => {
        const ship = Ship.createShip(2, 3, 3, 'horizontal');
        
        expect(ship.locations).toEqual(['23', '24', '25']);
        expect(ship.orientation).toBe('horizontal');
        expect(ship.length).toBe(3);
      });

      test('should create vertical ship correctly', () => {
        const ship = Ship.createShip(1, 5, 4, 'vertical');
        
        expect(ship.locations).toEqual(['15', '25', '35', '45']);
        expect(ship.orientation).toBe('vertical');
        expect(ship.length).toBe(4);
      });

      test('should create single-location ship', () => {
        const ship = Ship.createShip(7, 8, 1, 'horizontal');
        
        expect(ship.locations).toEqual(['78']);
        expect(ship.length).toBe(1);
      });
    });

    describe('isValidPlacement', () => {
      const boardSize = 10;

      test('should validate horizontal ship within bounds', () => {
        expect(Ship.isValidPlacement(0, 0, 3, 'horizontal', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(5, 7, 3, 'horizontal', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(9, 7, 3, 'horizontal', boardSize)).toBe(true);
      });

      test('should invalidate horizontal ship outside bounds', () => {
        expect(Ship.isValidPlacement(0, 8, 3, 'horizontal', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(-1, 0, 3, 'horizontal', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(10, 0, 3, 'horizontal', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(0, -1, 3, 'horizontal', boardSize)).toBe(false);
      });

      test('should validate vertical ship within bounds', () => {
        expect(Ship.isValidPlacement(0, 0, 3, 'vertical', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(7, 5, 3, 'vertical', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(7, 9, 3, 'vertical', boardSize)).toBe(true);
      });

      test('should invalidate vertical ship outside bounds', () => {
        expect(Ship.isValidPlacement(8, 0, 3, 'vertical', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(-1, 0, 3, 'vertical', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(0, 10, 3, 'vertical', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(0, -1, 3, 'vertical', boardSize)).toBe(false);
      });

      test('should handle edge cases', () => {
        expect(Ship.isValidPlacement(9, 9, 1, 'horizontal', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(9, 9, 1, 'vertical', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(0, 0, 10, 'horizontal', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(0, 0, 10, 'vertical', boardSize)).toBe(true);
        expect(Ship.isValidPlacement(0, 0, 11, 'horizontal', boardSize)).toBe(false);
        expect(Ship.isValidPlacement(0, 0, 11, 'vertical', boardSize)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty ship operations', () => {
      const ship = new Ship([]);
      
      expect(ship.hasLocation('00')).toBe(false);
      expect(ship.hit('00')).toBe(false);
      expect(ship.isHit('00')).toBe(false);
      expect(ship.isSunk()).toBe(true); // Empty ship is considered sunk
      expect(ship.getHitCount()).toBe(0);
    });

    test('should handle coordinate format edge cases', () => {
      const ship = new Ship(['00', '99']);
      
      expect(ship.hasLocation('00')).toBe(true);
      expect(ship.hasLocation('99')).toBe(true);
      expect(ship.hasLocation('0')).toBe(false);
      expect(ship.hasLocation('000')).toBe(false);
    });
  });
}); 