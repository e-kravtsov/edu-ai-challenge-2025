/**
 * Sea Battle Game Configuration
 * Contains all configurable game parameters and constants
 */

export const GAME_CONFIG = {
  BOARD_SIZE: 10,
  SHIP_COUNT: 3,
  SHIP_LENGTH: 3,
  
  SYMBOLS: {
    WATER: '~',
    SHIP: 'S',
    HIT: 'X',
    MISS: 'O'
  },
  
  AI_MODES: {
    HUNT: 'hunt',
    TARGET: 'target'
  },
  
  ORIENTATIONS: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
  },
  
  GAME_STATES: {
    PLAYING: 'playing',
    PLAYER_WIN: 'player_win',
    CPU_WIN: 'cpu_win'
  }
};

export const MESSAGES = {
  GAME_START: "Let's play Sea Battle!",
  GAME_INIT: (shipCount) => `Try to sink the ${shipCount} enemy ships.`,
  BOARDS_CREATED: 'Boards created.',
  SHIPS_PLACED: (count, player) => `${count} ships placed randomly for ${player}.`,
  
  PLAYER_HIT: 'PLAYER HIT!',
  PLAYER_MISS: 'PLAYER MISS.',
  PLAYER_SUNK: 'You sunk an enemy battleship!',
  
  CPU_HIT: (coord) => `CPU HIT at ${coord}!`,
  CPU_MISS: (coord) => `CPU MISS at ${coord}.`,
  CPU_SUNK: 'CPU sunk your battleship!',
  CPU_TURN: "--- CPU's Turn ---",
  CPU_TARGET: (coord) => `CPU targets: ${coord}`,
  
  VICTORY: '*** CONGRATULATIONS! You sunk all enemy battleships! ***',
  DEFEAT: '*** GAME OVER! The CPU sunk all your battleships! ***',
  
  INPUT_PROMPT: 'Enter your guess (e.g., 00): ',
  INPUT_INVALID_LENGTH: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
  INPUT_INVALID_RANGE: (max) => `Oops, please enter valid row and column numbers between 0 and ${max}.`,
  INPUT_ALREADY_GUESSED: 'You already guessed that location!',
  INPUT_ALREADY_HIT: 'You already hit that spot!'
};

export default GAME_CONFIG; 