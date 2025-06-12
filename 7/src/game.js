import { Board } from './models/board.js';
import { Player } from './models/player.js';
import { AIPlayer } from './models/ai-player.js';
import { GAME_CONFIG, MESSAGES } from './config/game-config.js';

/**
 * Main Game class that orchestrates the Sea Battle game
 */
export class Game {
  #player;
  #aiPlayer;
  #currentPlayer;
  #gameState;
  #gameStats;

  /**
   * Creates a new game instance
   */
  constructor() {
    this.#gameState = GAME_CONFIG.GAME_STATES.PLAYING;
    this.#gameStats = {
      startTime: null,
      endTime: null,
      totalTurns: 0,
      playerTurns: 0,
      aiTurns: 0
    };
    this.#initializePlayers();
  }

  /**
   * Gets the human player
   * @returns {Player} Human player
   */
  get player() {
    return this.#player;
  }

  /**
   * Gets the AI player
   * @returns {AIPlayer} AI player
   */
  get aiPlayer() {
    return this.#aiPlayer;
  }

  /**
   * Gets the current player
   * @returns {Player} Current player
   */
  get currentPlayer() {
    return this.#currentPlayer;
  }

  /**
   * Gets the current game state
   * @returns {string} Game state
   */
  get gameState() {
    return this.#gameState;
  }

  /**
   * Gets game statistics
   * @returns {Object} Game statistics
   */
  get gameStats() {
    return { ...this.#gameStats };
  }

  /**
   * Initializes the players and their boards
   * @private
   */
  #initializePlayers() {
    const playerBoard = new Board();
    const aiBoard = new Board();

    this.#player = new Player('Player', playerBoard, aiBoard);
    this.#aiPlayer = new AIPlayer('CPU', aiBoard, playerBoard);
    
    this.#currentPlayer = this.#player; // Player starts first
  }

  /**
   * Starts a new game
   * @returns {Promise<boolean>} Promise resolving to true if game started successfully
   */
  async startGame() {
    try {
      this.#gameStats.startTime = new Date();
      this.#gameState = GAME_CONFIG.GAME_STATES.PLAYING;

      // Set up player boards with ships
      const playerSetup = this.#player.setupBoard();
      const aiSetup = this.#aiPlayer.setupBoard();

      if (!playerSetup || !aiSetup) {
        throw new Error('Failed to set up game boards');
      }

      return true;
    } catch (error) {
      console.error('Failed to start game:', error);
      return false;
    }
  }

  /**
   * Processes a player's turn
   * @param {string} coordinate - Coordinate to attack (for human player)
   * @returns {Promise<Object>} Turn result
   */
  async processTurn(coordinate = null) {
    if (this.#gameState !== GAME_CONFIG.GAME_STATES.PLAYING) {
      return { 
        success: false, 
        error: 'Game is not in playing state' 
      };
    }

    this.#gameStats.totalTurns++;

    try {
      let result;

      if (this.#currentPlayer === this.#player) {
        result = await this.#processPlayerTurn(coordinate);
        this.#gameStats.playerTurns++;
      } else {
        result = await this.#processAITurn();
        this.#gameStats.aiTurns++;
      }

      // Check for game end conditions
      this.#checkGameEnd();

      // Switch players if the game is still ongoing
      if (this.#gameState === GAME_CONFIG.GAME_STATES.PLAYING) {
        this.#switchPlayer();
      }

      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Processes a human player's turn
   * @param {string} coordinate - Coordinate to attack
   * @returns {Promise<Object>} Turn result
   * @private
   */
  async #processPlayerTurn(coordinate) {
    if (!coordinate) {
      return { 
        success: false, 
        error: 'Coordinate is required for player turn' 
      };
    }

    const attackResult = this.#player.makeGuess(coordinate);
    
    if (!attackResult.success) {
      return attackResult;
    }

    const { result } = attackResult;
    const messages = this.#generatePlayerMessages(result);

    return {
      success: true,
      result: {
        player: 'Player',
        coordinate: result.coordinate,
        hit: result.hit,
        sunk: result.sunk,
        messages,
        remainingShips: this.#aiPlayer.getRemainingShips()
      }
    };
  }

  /**
   * Processes an AI player's turn
   * @returns {Promise<Object>} Turn result
   * @private
   */
  async #processAITurn() {
    const coordinate = await this.#aiPlayer.getNextMove();
    const attackResult = this.#aiPlayer.makeGuess(coordinate);

    if (!attackResult.success) {
      throw new Error(`AI turn failed: ${attackResult.error}`);
    }

    const { result } = attackResult;
    
    // Notify AI of the attack result for strategy updates
    this.#aiPlayer.onAttackResult(attackResult);

    const messages = this.#generateAIMessages(result);

    return {
      success: true,
      result: {
        player: 'CPU',
        coordinate: result.coordinate,
        hit: result.hit,
        sunk: result.sunk,
        messages,
        remainingShips: this.#player.getRemainingShips(),
        aiMode: this.#aiPlayer.mode
      }
    };
  }

  /**
   * Generates messages for player attacks
   * @param {Object} result - Attack result
   * @returns {Array<string>} Array of messages
   * @private
   */
  #generatePlayerMessages(result) {
    const messages = [MESSAGES.CPU_TURN];

    if (result.hit) {
      messages.push(MESSAGES.PLAYER_HIT);
      if (result.sunk) {
        messages.push(MESSAGES.PLAYER_SUNK);
      }
    } else {
      messages.push(MESSAGES.PLAYER_MISS);
    }

    return messages;
  }

  /**
   * Generates messages for AI attacks
   * @param {Object} result - Attack result
   * @returns {Array<string>} Array of messages
   * @private
   */
  #generateAIMessages(result) {
    const messages = [MESSAGES.CPU_TURN];

    if (result.hit) {
      messages.push(MESSAGES.CPU_HIT(result.coordinate));
      if (result.sunk) {
        messages.push(MESSAGES.CPU_SUNK);
      }
    } else {
      messages.push(MESSAGES.CPU_MISS(result.coordinate));
    }

    return messages;
  }

  /**
   * Switches the current player
   * @private
   */
  #switchPlayer() {
    this.#currentPlayer = this.#currentPlayer === this.#player ? 
      this.#aiPlayer : this.#player;
  }

  /**
   * Checks if the game has ended and updates game state
   * @private
   */
  #checkGameEnd() {
    if (this.#player.hasWon()) {
      this.#gameState = GAME_CONFIG.GAME_STATES.PLAYER_WIN;
      this.#gameStats.endTime = new Date();
    } else if (this.#aiPlayer.hasWon()) {
      this.#gameState = GAME_CONFIG.GAME_STATES.CPU_WIN;
      this.#gameStats.endTime = new Date();
    }
  }

  /**
   * Checks if the game is over
   * @returns {boolean} True if game is over
   */
  isGameOver() {
    return this.#gameState !== GAME_CONFIG.GAME_STATES.PLAYING;
  }

  /**
   * Gets the winner of the game
   * @returns {string|null} Winner name or null if no winner
   */
  getWinner() {
    switch (this.#gameState) {
      case GAME_CONFIG.GAME_STATES.PLAYER_WIN:
        return 'Player';
      case GAME_CONFIG.GAME_STATES.CPU_WIN:
        return 'CPU';
      default:
        return null;
    }
  }

  /**
   * Gets the game end message
   * @returns {string|null} End game message or null if game not over
   */
  getEndMessage() {
    switch (this.#gameState) {
      case GAME_CONFIG.GAME_STATES.PLAYER_WIN:
        return MESSAGES.VICTORY;
      case GAME_CONFIG.GAME_STATES.CPU_WIN:
        return MESSAGES.DEFEAT;
      default:
        return null;
    }
  }

  /**
   * Gets the display boards (player board shows ships, AI board doesn't)
   * @returns {Object} Display boards
   */
  getDisplayBoards() {
    return {
      playerBoard: this.#player.board.toString(true),  // Show ships
      aiBoard: this.#aiPlayer.board.toString(false),   // Hide ships
      playerBoardGrid: this.#player.board.getGridCopy(),
      aiBoardGrid: this.#aiPlayer.board.getGridCopy()
    };
  }

  /**
   * Gets comprehensive game statistics
   * @returns {Object} Detailed game statistics
   */
  getDetailedStats() {
    const playerStats = this.#player.getStats();
    const aiStats = this.#aiPlayer.getStats();
    const duration = this.#gameStats.endTime && this.#gameStats.startTime ?
      this.#gameStats.endTime - this.#gameStats.startTime : null;

    return {
      game: {
        ...this.#gameStats,
        duration: duration ? Math.round(duration / 1000) : null,
        winner: this.getWinner(),
        state: this.#gameState
      },
      player: playerStats,
      ai: {
        ...aiStats,
        strategy: this.#aiPlayer.getStrategyInfo()
      }
    };
  }

  /**
   * Resets the game to initial state
   */
  reset() {
    this.#initializePlayers();
    this.#gameState = GAME_CONFIG.GAME_STATES.PLAYING;
    this.#gameStats = {
      startTime: null,
      endTime: null,
      totalTurns: 0,
      playerTurns: 0,
      aiTurns: 0
    };
  }

  /**
   * Validates if a coordinate is valid for the current player
   * @param {string} coordinate - Coordinate to validate
   * @returns {{valid: boolean, error?: string}} Validation result
   */
  validateMove(coordinate) {
    if (this.#currentPlayer !== this.#player) {
      return { 
        valid: false, 
        error: 'Not player\'s turn' 
      };
    }

    return this.#player.validateCoordinate(coordinate);
  }

  /**
   * Gets the current turn information
   * @returns {Object} Turn information
   */
  getTurnInfo() {
    return {
      currentPlayer: this.#currentPlayer.name,
      isPlayerTurn: this.#currentPlayer === this.#player,
      turnNumber: this.#gameStats.totalTurns + 1,
      gameState: this.#gameState
    };
  }
} 