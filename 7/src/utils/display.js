import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Display utility class for rendering game boards and UI
 */
export class Display {
  /**
   * Renders both player and AI boards side by side
   * @param {Object} boards - Board data from game.getDisplayBoards()
   * @returns {string} Formatted board display
   */
  static renderBoards(boards) {
    const { playerBoardGrid, aiBoardGrid } = boards;
    let display = '\n';
    
    // Headers
    display += '   --- OPPONENT BOARD ---          --- YOUR BOARD ---\n';
    
    // Column headers
    let header = '  ';
    for (let h = 0; h < GAME_CONFIG.BOARD_SIZE; h++) {
      header += `${h} `;
    }
    display += `${header}     ${header}\n`;

    // Board rows
    for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
      let rowStr = `${row} `;

      // AI board (opponent) - hide ships
      for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        let symbol = aiBoardGrid[row][col];
        // Hide unhit ships on opponent board
        if (symbol === GAME_CONFIG.SYMBOLS.SHIP) {
          symbol = GAME_CONFIG.SYMBOLS.WATER;
        }
        rowStr += `${symbol} `;
      }

      rowStr += `    ${row} `;

      // Player board - show everything
      for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
        rowStr += `${playerBoardGrid[row][col]} `;
      }

      display += `${rowStr}\n`;
    }

    display += '\n';
    return display;
  }

  /**
   * Renders game title
   * @returns {string} Game title
   */
  static renderGameTitle() {
    return `\n=== SEA BATTLE - Modern Edition ===\n`;
  }

  /**
   * Renders game instructions
   * @returns {string} Game instructions
   */
  static renderInstructions() {
    return `\nINSTRUCTIONS:
• Enter coordinates as two digits (e.g., 00, 34, 99)
• First digit is row (0-9), second digit is column (0-9)
• ~ = Water, S = Your Ship, X = Hit, O = Miss
• Try to sink all ${GAME_CONFIG.SHIP_COUNT} enemy ships!\n`;
  }

  /**
   * Renders game messages
   * @param {Array<string>} messages - Array of message strings
   * @returns {string} Formatted messages
   */
  static renderMessages(messages) {
    if (!messages || messages.length === 0) {
      return '';
    }
    
    return messages.map(msg => `${msg}\n`).join('');
  }
} 