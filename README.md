# Sudoku Solver Web Application

A simple, responsive Sudoku Solver built using **HTML, CSS, and JavaScript** (no frameworks, no libraries — just plain code).

## Features
- Interactive 9x9 Sudoku grid
- Puzzle generation with 3 difficulty levels (Easy / Medium / Hard)
- Recursive backtracking algorithm for solving and generating puzzles
- Real-time input validation (highlights conflicting numbers instantly)
- Solve button — instantly fills the correct solution
- Hint button — reveals one correct number
- Reset button — clears your entries and keeps the same puzzle
- Check button — checks if your current entries are correct
- Live timer and mistake counter
- Keyboard navigation using Arrow keys, Backspace/Delete to clear a cell

## Folder Structure
```
sudoku-solver/
│
├── index.html          -> Main HTML file (structure of the page)
├── README.md            -> This file (instructions)
│
├── css/
│   └── style.css        -> All styling for the app
│
└── js/
    └── script.js         -> All JavaScript logic (generation, solving, UI)
```

## How to Run the Project

You do **NOT** need any installation, server, or build tools. It's a plain static website.

### Option 1: Just open the file directly (easiest)
1. Download / unzip the `sudoku-solver` folder.
2. Open the folder and double-click on **`index.html`**.
3. It will open in your default web browser (Chrome, Edge, Firefox, etc.) and the app will run immediately.

### Option 2: Run using VS Code Live Server (recommended for development)
1. Open the `sudoku-solver` folder in VS Code.
2. Install the **"Live Server"** extension (if not already installed).
3. Right-click on `index.html` → click **"Open with Live Server"**.
4. The app will open in your browser at something like `http://127.0.0.1:5500/index.html`.

### Option 3: Run using Python's built-in server (optional)
If you have Python installed, open a terminal inside the `sudoku-solver` folder and run:
```
python -m http.server 8000
```
Then open your browser and go to:
```
http://localhost:8000
```

## How to Use
1. When the page loads, a new puzzle is generated automatically.
2. Click on any empty (white) cell and type a number from 1-9.
3. Locked/grey cells are the original given clues and cannot be edited.
4. Use **New Game** to generate a fresh puzzle (choose difficulty from the dropdown first).
5. Use **Solve** to instantly see the full solution.
6. Use **Hint** to reveal one random correct number.
7. Use **Reset** to clear your answers but keep the same puzzle.
8. Use **Check** to verify if your current entries are correct.
9. Use **Arrow keys** to move between cells, and **Backspace/Delete** to clear a cell.

## Technologies Used
- HTML5
- CSS3 (Flexbox + CSS Grid)
- Vanilla JavaScript (ES6)

## Notes
- No external libraries or frameworks were used — everything is written from scratch for learning purposes.
- The solving algorithm uses **recursive backtracking**, which tries numbers one at a time and "backtracks" (undoes a step) whenever it hits a dead end, until the full board is correctly solved.
