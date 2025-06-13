import { jest } from '@jest/globals';
import { MESSAGES } from '../src/config/game-config.js';

// Mock Board before all other imports
jest.unstable_mockModule('../src/models/board.js', () => ({
  Board: jest.fn(() => ({
    size: 10, // Mock board size for validation
    processAttack: jest.fn(),
  })),
}));

// Dynamically import modules after mocking
const { Board } = await import('../src/models/board.js');
const { Player } = await import('../src/models/player.js');
const { AIPlayer } = await import('../src/models/ai-player.js');

describe('Player', () => {
  let player;
  let mockBoard;

  beforeEach(() => {
    // Clear mocks before each test
    Board.mockClear();
    mockBoard = new Board();
    player = new Player('Human', mockBoard);
  });

  describe('Constructor', () => {
    it('should throw an error if not provided a name or board', () => {
      expect(() => new Player()).toThrow('Player must have a name and a board.');
      expect(() => new Player('Test')).toThrow('Player must have a name and a board.');
    });
  });

  describe('validateGuess()', () => {
    it('should return valid for a correct, new guess', () => {
      const result = player.validateGuess('00');
      expect(result.isValid).toBe(true);
    });

    it('should return invalid for guess with wrong length', () => {
      const result = player.validateGuess('1');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(MESSAGES.INPUT_INVALID_LENGTH);
    });

    it('should return invalid for out-of-bounds guess', () => {
      const result = player.validateGuess('a9'); // 'a' is not a number
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for a repeated guess', () => {
      player.makeGuess('22', new Board()); // Make a guess to record it
      const result = player.validateGuess('22');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe(MESSAGES.INPUT_ALREADY_GUESSED);
    });
  });

  describe('makeGuess()', () => {
    it('should call processAttack on the opponent board', () => {
      const opponentBoard = new Board();
      player.makeGuess('33', opponentBoard);
      expect(opponentBoard.processAttack).toHaveBeenCalledWith('33');
    });

    it('should record the guess', () => {
      player.makeGuess('44', new Board());
      expect(player.hasGuessed('44')).toBe(true);
    });
  });
});

describe('AIPlayer', () => {
  let ai;
  let mockPlayerBoard;

  beforeEach(() => {
    // Clear mocks before each test
    Board.mockClear();
    mockPlayerBoard = new Board();
    ai = new AIPlayer('CPU', mockPlayerBoard);
  });

  describe('getNextMove()', () => {
    it('should make a random guess in hunt mode', () => {
      const spy = jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
      const move = ai.getNextMove();
      expect(move).toBe('55');
      spy.mockRestore();
    });

    it('should not guess the same spot twice in hunt mode', () => {
      ai.makeGuess('55', new Board()); // Record '55' as guessed

      // Mock Math.random to return 0.5 first (generates '55'), then a different value
      const spy = jest.spyOn(global.Math, 'random')
        .mockReturnValueOnce(0.5) // This will generate '55' and cause the loop to repeat
        .mockReturnValue(0.6);  // This will generate '66' on the second try

      const move = ai.getNextMove();
      
      expect(move).not.toBe('55');
      expect(move).toBe('56'); // Corrected expectation based on random() logic
      spy.mockRestore();
    });

    it('should take a move from the target queue in target mode', () => {
      ai.processAttackResult({ hit: true, sunk: false }, '22');
      const move = ai.getNextMove();
      expect(['12', '32', '21', '23']).toContain(move);
    });
  });

  describe('processAttackResult()', () => {
    it('should switch to target mode on a hit', () => {
      ai.processAttackResult({ hit: true, sunk: false }, '33');
      const move = ai.getNextMove();
      expect(['23', '43', '32', '34']).toContain(move);
    });

    it('should stay in hunt mode on a miss', () => {
      ai.processAttackResult({ hit: false }, '44');
      const spy = jest.spyOn(global.Math, 'random').mockReturnValue(0.1);
      const move = ai.getNextMove();
      expect(move).toBe('11');
      spy.mockRestore();
    });

    it('should switch back to hunt mode when a ship is sunk', () => {
      ai.processAttackResult({ hit: true, sunk: false }, '55');
      ai.processAttackResult({ hit: true, sunk: true }, '56');
      const spy = jest.spyOn(global.Math, 'random').mockReturnValue(0.2);
      const move = ai.getNextMove();
      expect(move).toBe('22');
      spy.mockRestore();
    });
  });
}); 