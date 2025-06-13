/**
 * Centralized game configuration - replaces legacy global variables
 */

export const GAME_CONFIG = {
  // Board settings
  BOARD_SIZE: 10,
  
  // Ship settings  
  SHIP_COUNT: 3,
  SHIP_LENGTH: 3,
  
  // Display symbols
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S', 
    HIT: 'X',
    MISS: 'O'
  },
  
  // Ship orientations
  ORIENTATIONS: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
  },
  
  // AI modes
  AI_MODES: {
    HUNT: 'hunt',
    TARGET: 'target'
  },
  
  // Game states
  GAME_STATES: {
    PLAYING: 'playing',
    PLAYER_WIN: 'player_win',
    CPU_WIN: 'cpu_win'
  }
};

export const MESSAGES = {
  // Game initialization
  BOARDS_CREATED: 'Boards created.',
  SHIPS_PLACED: (count, player) => `${count} ships placed randomly for ${player}.`,
  GAME_START: "\nLet's play Sea Battle!",
  GAME_INIT: (count) => `Try to sink the ${count} enemy ships.`,
  
  // Input prompts and validation
  INPUT_PROMPT: 'Enter your guess (e.g., 00): ',
  INPUT_INVALID_LENGTH: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
  INPUT_INVALID_RANGE: (max) => `Oops, please enter valid row and column numbers between 0 and ${max}.`,
  INPUT_ALREADY_GUESSED: 'You already guessed that location!',
  
  // Game actions
  PLAYER_HIT: 'PLAYER HIT!',
  PLAYER_MISS: 'PLAYER MISS.',
  PLAYER_SUNK: 'You sunk an enemy battleship!',
  
  CPU_TURN: "\n--- CPU's Turn ---",
  CPU_HIT: (coordinate) => `CPU HIT at ${coordinate}!`,
  CPU_MISS: (coordinate) => `CPU MISS at ${coordinate}.`,
  CPU_SUNK: 'CPU sunk your battleship!',
  CPU_TARGET: (coordinate) => `CPU targets: ${coordinate}`,
  
  // Game end
  VICTORY: '\n*** CONGRATULATIONS! You sunk all enemy battleships! ***',
  DEFEAT: '\n*** GAME OVER! The CPU sunk all your battleships! ***'
}; 