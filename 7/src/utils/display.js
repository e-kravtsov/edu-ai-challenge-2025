import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Display utility for rendering game boards and UI elements.
 * This isolates all console output from the game logic.
 */
export class Display {
  /**
   * Renders the player and opponent boards side-by-side.
   * @param {Board} playerBoard - The human player's board.
   * @param {Board} opponentBoard - The opponent's board.
   */
  static printBoards(playerBoard, opponentBoard) {
    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    let header = '  ';
    for (let h = 0; h < GAME_CONFIG.BOARD_SIZE; h++) {
      header += `${h} `;
    }
    console.log(`${header}     ${header}`);

    const playerGrid = playerBoard.getGridCopy();
    const opponentGrid = opponentBoard.getGridCopy();

    for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
      let rowStr = `${i} `;
      
      // Opponent's board (hide ships)
      for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
        const symbol = opponentGrid[i][j];
        rowStr += (symbol === GAME_CONFIG.SYMBOLS.SHIP ? GAME_CONFIG.SYMBOLS.WATER : symbol) + ' ';
      }

      rowStr += `    ${i} `;

      // Player's board (show ships)
      for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
        rowStr += `${playerGrid[i][j]} `;
      }
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Prints a message to the console.
   * @param {string} message - The message to print.
   */
  static printMessage(message) {
    console.log(message);
  }

  /**
   * Prints the result of a player's attack.
   * @param {object} result - The attack result object.
   */
  static printPlayerAttackResult(result) {
    if (result.wasAlreadyHit) {
        this.printMessage('You already hit that spot!');
        return;
    }
    if (result.hit) {
      this.printMessage(MESSAGES.PLAYER_HIT);
      if (result.sunk) {
        this.printMessage(MESSAGES.PLAYER_SUNK);
      }
    } else {
      this.printMessage(MESSAGES.PLAYER_MISS);
    }
  }

  /**
   * Prints the result of the AI's attack.
   * @param {object} result - The attack result object.
   * @param {string} coordinate - The coordinate the AI attacked.
   */
  static printCpuAttackResult(result, coordinate) {
    if (result.hit) {
      this.printMessage(MESSAGES.CPU_HIT(coordinate));
      if (result.sunk) {
        this.printMessage(MESSAGES.CPU_SUNK);
      }
    } else {
      this.printMessage(MESSAGES.CPU_MISS(coordinate));
    }
  }
}

// Re-importing MESSAGES here to avoid circular dependency issues if Display is imported elsewhere.
import { MESSAGES } from '../config/game-config.js'; 