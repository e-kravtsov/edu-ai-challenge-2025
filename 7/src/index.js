import readline from 'readline';
import { Game } from './game.js';
import { Display } from './utils/display.js';
import { MESSAGES } from './config/game-config.js';

/**
 * Main application class that handles the console interface
 */
class SeaBattleApp {
  #game;
  #rl;

  constructor() {
    this.#game = new Game();
    this.#rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Starts the application
   */
  async start() {
    try {
      console.log(Display.renderGameTitle());
      console.log(Display.renderInstructions());
      
      const gameStarted = await this.#game.startGame();
      if (!gameStarted) {
        console.log('Failed to start game. Exiting...');
        process.exit(1);
      }

      console.log(MESSAGES.BOARDS_CREATED);
      console.log(MESSAGES.SHIPS_PLACED(3, 'Player'));
      console.log(MESSAGES.SHIPS_PLACED(3, 'CPU'));
      console.log(MESSAGES.GAME_START);
      console.log(MESSAGES.GAME_INIT(3));

      await this.#gameLoop();
    } catch (error) {
      console.error('Application error:', error);
      process.exit(1);
    }
  }

  /**
   * Main game loop
   * @private
   */
  async #gameLoop() {
    while (!this.#game.isGameOver()) {
      // Display current state
      const boards = this.#game.getDisplayBoards();
      console.log(Display.renderBoards(boards));

      const turnInfo = this.#game.getTurnInfo();
      
      if (turnInfo.isPlayerTurn) {
        await this.#handlePlayerTurn();
      } else {
        await this.#handleAITurn();
      }

      // Small delay for better UX
      await this.#delay(500);
    }

    await this.#handleGameEnd();
  }

  /**
   * Handles player turn
   * @private
   */
  async #handlePlayerTurn() {
    let validMove = false;
    
    while (!validMove) {
      try {
        const input = await this.#promptUser(MESSAGES.INPUT_PROMPT);
        
        const validation = this.#game.validateMove(input);
        if (!validation.valid) {
          console.log(validation.error);
          continue;
        }

        const result = await this.#game.processTurn(input);
        
        if (result.success) {
          const messages = result.result.messages;
          console.log(Display.renderMessages(messages));
          
          if (result.result.hit) {
            console.log(MESSAGES.PLAYER_HIT);
            if (result.result.sunk) {
              console.log(MESSAGES.PLAYER_SUNK);
            }
          } else {
            console.log(MESSAGES.PLAYER_MISS);
          }
          
          validMove = true;
        } else {
          console.log(result.error);
        }
      } catch (error) {
        console.log('Invalid input. Please try again.');
      }
    }
  }

  /**
   * Handles AI turn
   * @private
   */
  async #handleAITurn() {
    console.log(MESSAGES.CPU_TURN);
    
    // Add delay to simulate AI thinking
    await this.#delay(1000);
    
    const result = await this.#game.processTurn();
    
    if (result.success) {
      const { coordinate, hit, sunk } = result.result;
      
      if (hit) {
        console.log(MESSAGES.CPU_HIT(coordinate));
        if (sunk) {
          console.log(MESSAGES.CPU_SUNK);
        }
      } else {
        console.log(MESSAGES.CPU_MISS(coordinate));
      }
    } else {
      console.error('AI turn failed:', result.error);
    }
  }

  /**
   * Handles game end
   * @private
   */
  async #handleGameEnd() {
    const boards = this.#game.getDisplayBoards();
    console.log(Display.renderBoards(boards));
    
    const endMessage = this.#game.getEndMessage();
    console.log(endMessage);
    
    const stats = this.#game.getDetailedStats();
    this.#displayFinalStats(stats);
    
    const playAgain = await this.#promptUser('Would you like to play again? (y/n): ');
    if (playAgain.toLowerCase().startsWith('y')) {
      this.#game.reset();
      await this.start();
    } else {
      console.log('Thanks for playing Sea Battle!');
      this.#rl.close();
    }
  }

  /**
   * Displays final game statistics
   * @param {Object} stats - Game statistics
   * @private
   */
  #displayFinalStats(stats) {
    const { game, player, ai } = stats;
    
    console.log('\n=== FINAL STATISTICS ===');
    console.log(`Game Duration: ${game.duration ? `${game.duration}s` : 'N/A'}`);
    console.log(`Total Turns: ${game.totalTurns}`);
    console.log(`Winner: ${game.winner}`);
    
    console.log('\n--- Your Performance ---');
    console.log(`Ships Remaining: ${player.ownBoard.remainingShips}/${player.ownBoard.totalShips}`);
    console.log(`Accuracy: ${player.attacks.accuracy}%`);
    console.log(`Total Shots: ${player.attacks.totalGuesses}`);
    
    console.log('\n--- AI Performance ---');
    console.log(`Ships Remaining: ${ai.ownBoard.remainingShips}/${ai.ownBoard.totalShips}`);
    console.log(`Accuracy: ${ai.attacks.accuracy}%`);
    console.log(`Total Shots: ${ai.attacks.totalGuesses}`);
    console.log(`Final AI Mode: ${ai.strategy.mode}`);
  }

  /**
   * Prompts user for input
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User input
   * @private
   */
  #promptUser(question) {
    return new Promise((resolve) => {
      this.#rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Creates a delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   * @private
   */
  #delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handles process exit
   * @private
   */
  #handleExit() {
    console.log('\nGame interrupted. Thanks for playing!');
    this.#rl.close();
    process.exit(0);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nGame interrupted. Thanks for playing!');
  process.exit(0);
});

// Start the application
const app = new SeaBattleApp();
app.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 