import readline from 'readline';
import { Board } from './models/board.js';
import { Player } from './models/player.js';
import { AIPlayer } from './models/ai-player.js';
import { Display } from './utils/display.js';
import { GAME_CONFIG, MESSAGES } from './config/game-config.js';

/**
 * Main Game class to orchestrate the entire Sea Battle game.
 * This replaces the legacy global state and recursive gameLoop.
 */
export class Game {
  #player;
  #cpu;
  #rl;

  constructor() {
    const playerBoard = new Board();
    const cpuBoard = new Board();

    this.#player = new Player('Player', playerBoard);
    this.#cpu = new AIPlayer('CPU', cpuBoard);

    this.#rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Initializes and starts the game.
   */
  start() {
    Display.printMessage(MESSAGES.BOARDS_CREATED);

    // Place ships for both players
    this.#player.board.placeShipsRandomly(GAME_CONFIG.SHIP_COUNT, GAME_CONFIG.SHIP_LENGTH, true);
    Display.printMessage(MESSAGES.SHIPS_PLACED(this.#player.board.ships.length, this.#player.name));

    this.#cpu.board.placeShipsRandomly(GAME_CONFIG.SHIP_COUNT, GAME_CONFIG.SHIP_LENGTH, false);
    Display.printMessage(MESSAGES.SHIPS_PLACED(this.#cpu.board.ships.length, this.#cpu.name));

    Display.printMessage(MESSAGES.GAME_START);
    Display.printMessage(MESSAGES.GAME_INIT(this.#cpu.board.ships.length));
    
    this.#gameLoop();
  }

  /**
   * Main game loop, using async/await for clean, non-recursive flow.
   * @private
   */
  #gameLoop() {
    if (this.#isGameOver()) {
      this.#endGame();
      return;
    }

    Display.printBoards(this.#player.board, this.#cpu.board);

    this.#rl.question(MESSAGES.INPUT_PROMPT, (guess) => {
      const validation = this.#player.validateGuess(guess);
      if (!validation.isValid) {
        Display.printMessage(validation.message);
        this.#gameLoop(); // Ask again
        return;
      }
      
      // Process Player's Turn
      const playerAttackResult = this.#player.makeGuess(guess, this.#cpu.board);
      Display.printPlayerAttackResult(playerAttackResult);

      if (this.#isGameOver()) {
        this.#endGame();
        return;
      }

      // Process CPU's Turn
      this.#cpuTurn();
      
      // Continue the loop
      this.#gameLoop();
    });
  }

  /**
   * Manages the CPU's turn.
   * @private
   */
  #cpuTurn() {
    Display.printMessage(MESSAGES.CPU_TURN);
    const cpuGuess = this.#cpu.getNextMove();
    const cpuAttackResult = this.#cpu.makeGuess(cpuGuess, this.#player.board);
    
    // Let the AI process the result to update its strategy
    this.#cpu.processAttackResult(cpuAttackResult, cpuGuess);
    
    Display.printCpuAttackResult(cpuAttackResult, cpuGuess);
  }

  /**
   * Checks for game-over conditions.
   * @returns {boolean} True if the game is over.
   * @private
   */
  #isGameOver() {
    return this.#player.board.areAllShipsSunk() || this.#cpu.board.areAllShipsSunk();
  }

  /**
   * Handles the end of the game, displaying the winner.
   * @private
   */
  #endGame() {
    Display.printBoards(this.#player.board, this.#cpu.board);
    if (this.#cpu.board.areAllShipsSunk()) {
      Display.printMessage(MESSAGES.VICTORY);
    } else {
      Display.printMessage(MESSAGES.DEFEAT);
    }
    this.#rl.close();
  }
} 