# Modern Sea Battle

This project is a completely modernized version of a legacy Sea Battle (Battleship) game. The original 333-line monolithic script has been refactored into a clean, modular, and well-tested application using modern ES6+ JavaScript and a class-based architecture.

## ✅ Features

*   **Modern JavaScript**: Built with ES6+ features like Classes, Modules, `const`/`let`, and `async/await`.
*   **Clean Architecture**: Follows clean architecture principles with a clear separation of concerns (models, display, game logic).
*   **Intelligent AI**: A CPU opponent that uses a "Hunt" and "Target" strategy to find and destroy ships.
*   **Comprehensive Test Suite**: Includes 43 unit tests with over 60% code coverage, ensuring reliability.
*   **Object-Oriented Design**: Fully class-based with proper encapsulation using private fields.
*   **Error Handling**: Robust input validation and error messages.

## 📂 Project Structure

The codebase is organized into a clean, modular structure:

```
.
├── src/
│   ├── config/
│   │   └── game-config.js      # Centralized game constants and messages
│   ├── models/
│   │   ├── ship.js             # Ship class
│   │   ├── board.js            # Board class
│   │   ├── player.js           # Base Player class
│   │   └── ai-player.js        # AIPlayer class with hunt/target logic
│   ├── utils/
│   │   └── display.js          # Handles all console rendering
│   ├── game.js                 # Main game orchestration class
│   └── index.js                # Application entry point
├── tests/
│   ├── ship.test.js
│   ├── board.test.js
│   └── player.test.js
├── package.json
├── refactoring.md              # Detailed report on the modernization process
└── README.md                   # This file
```

## ⚙️ Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd 7.1-modern
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## 🚀 Usage

### Running the Game

To start the game, run the following command in your terminal:

```bash
npm start
```

Follow the on-screen prompts to enter your guesses (e.g., `00`, `34`, `99`).

### Running Tests

To run the complete test suite:

```bash
npm test
```

### Checking Test Coverage

To run the tests and generate a detailed coverage report:

```bash
npm run test:coverage
```
This will display a summary in the console and create an HTML report in the `coverage/` directory. The project is configured to meet a 60% coverage threshold. 