/* ==========================================================================
   SUDOKU SOLVER - JAVASCRIPT LOGIC
   Written in a simple, beginner-friendly style with lots of comments
   so it's easy to understand every part of the code.
   ==========================================================================

   MAIN IDEAS USED IN THIS PROJECT:
   1. We store the sudoku board as a 9x9 2D array (0 means empty cell).
   2. We generate a fully solved board first using backtracking + randomness.
   3. We then "remove" numbers from that solved board to create a puzzle,
      based on the difficulty selected (easy/medium/hard).
   4. We keep a copy of the fully solved board so we can check answers,
      give hints, and use it for the "Solve" button.
   5. We use classic recursive backtracking to solve any given puzzle.
   ========================================================================== */


/* ---------- GLOBAL VARIABLES ---------- */

const SIZE = 9;               // Sudoku is always a 9x9 grid

let board = [];                // current board shown to the user (numbers user can edit)
let solutionBoard = [];        // the fully solved version of the current puzzle
let givenCells = [];           // true/false grid -> true means it's a fixed clue (not editable)

let timerInterval = null;      // will hold setInterval reference for the timer
let secondsElapsed = 0;        // total seconds passed since new game started
let mistakeCount = 0;          // counts how many wrong entries user has made

let selectedRow = 0;           // currently selected cell row (for keyboard navigation)
let selectedCol = 0;           // currently selected cell column


/* ---------- GRABBING HTML ELEMENTS ---------- */

const boardContainer = document.getElementById('sudoku-board');
const timerDisplay = document.getElementById('timer');
const mistakesDisplay = document.getElementById('mistakes');
const messageDisplay = document.getElementById('message');
const difficultySelect = document.getElementById('difficulty');

const newGameBtn = document.getElementById('newGameBtn');
const solveBtn = document.getElementById('solveBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');
const checkBtn = document.getElementById('checkBtn');


/* ==========================================================================
   SECTION 1: CORE SUDOKU LOGIC (helper functions)
   ========================================================================== */

// Creates an empty 9x9 board filled with zeros (0 = empty cell)
function createEmptyBoard() {
    let newBoard = [];
    for (let r = 0; r < SIZE; r++) {
        newBoard.push(new Array(SIZE).fill(0));
    }
    return newBoard;
}

// Checks if placing "num" at (row, col) is allowed according to sudoku rules
function isSafe(grid, row, col, num) {

    // Check the row - number should not already exist in this row
    for (let c = 0; c < SIZE; c++) {
        if (grid[row][c] === num) return false;
    }

    // Check the column - number should not already exist in this column
    for (let r = 0; r < SIZE; r++) {
        if (grid[r][col] === num) return false;
    }

    // Check the 3x3 sub-grid (box) that (row, col) belongs to
    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;

    for (let r = boxRowStart; r < boxRowStart + 3; r++) {
        for (let c = boxColStart; c < boxColStart + 3; c++) {
            if (grid[r][c] === num) return false;
        }
    }

    // If we reach here, no conflicts found, so it's safe
    return true;
}

// Shuffles an array randomly (used to randomize number order while generating puzzles)
// This is the standard "Fisher-Yates shuffle" algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* ---------------------------------------------------------------------------
   RECURSIVE BACKTRACKING SOLVER
   This function tries to fill empty cells one by one.
   If a wrong number causes a dead end later, it "backtracks"
   (undoes the last move) and tries a different number.
   This same function is used both to:
     (a) generate a completely solved random board
     (b) solve a puzzle when user clicks "Solve"
--------------------------------------------------------------------------- */
function solveSudoku(grid, randomize = false) {

    // Step 1: find the next empty cell (a cell with value 0)
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            if (grid[row][col] === 0) {

                // Try numbers 1 to 9 in this empty cell
                let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

                // If randomize is true, shuffle the numbers first.
                // This is used when generating a brand new random solved board.
                if (randomize) {
                    numbers = shuffleArray(numbers);
                }

                for (let num of numbers) {

                    if (isSafe(grid, row, col, num)) {

                        grid[row][col] = num;   // place the number (a guess)

                        // Recursively try to solve the rest of the board
                        if (solveSudoku(grid, randomize)) {
                            return true;   // solved successfully, stop here
                        }

                        // If we reach here, the guess didn't work out later on,
                        // so we undo it (this is the "backtracking" step)
                        grid[row][col] = 0;
                    }
                }

                // None of 1-9 worked in this cell, so this path is invalid
                return false;
            }
        }
    }

    // If no empty cell was found, the board is completely and correctly filled
    return true;
}

// Generates a brand new, fully solved sudoku board (random each time)
function generateSolvedBoard() {
    let newBoard = createEmptyBoard();
    solveSudoku(newBoard, true);  // true = fill it in random order
    return newBoard;
}

// Removes numbers from a solved board to create the puzzle
// "holes" decides how many cells become empty (this controls difficulty)
function removeNumbers(grid, holes) {
    let puzzle = grid.map(row => [...row]); // make a proper copy of the array

    let removed = 0;
    while (removed < holes) {
        let row = Math.floor(Math.random() * SIZE);
        let col = Math.floor(Math.random() * SIZE);

        // Only remove if that cell is not already empty
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removed++;
        }
    }

    return puzzle;
}


/* ==========================================================================
   SECTION 2: BUILDING & RENDERING THE BOARD ON THE PAGE
   ========================================================================== */

// This function builds the 81 input boxes and places them inside #sudoku-board
function renderBoard() {

    boardContainer.innerHTML = ''; // clear old board first (used when starting a new game)

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {

            // Create one <input> element per cell
            let input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.classList.add('cell');

            // Store row/col info directly on the element using data attributes
            // so we can easily know which cell was clicked/typed in later
            input.dataset.row = row;
            input.dataset.col = col;

            let value = board[row][col];

            if (value !== 0) {
                input.value = value;
            }

            // If this cell was part of the original puzzle, lock it (not editable)
            if (givenCells[row][col]) {
                input.classList.add('given');
                input.disabled = true;
            }

            // Listen for user typing a number
            input.addEventListener('input', handleCellInput);

            // Listen for keyboard arrow keys to move between cells
            input.addEventListener('keydown', handleKeyNavigation);

            // Listen for clicking on a cell (for highlighting row/col/box)
            input.addEventListener('focus', () => highlightRelatedCells(row, col));

            boardContainer.appendChild(input);
        }
    }
}

// Grabs the actual <input> DOM element for a given row and column
function getCellElement(row, col) {
    return boardContainer.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}


/* ==========================================================================
   SECTION 3: HANDLING USER INPUT (typing numbers, validation)
   ========================================================================== */

function handleCellInput(e) {
    let input = e.target;
    let row = parseInt(input.dataset.row);
    let col = parseInt(input.dataset.col);

    // Remove anything that isn't a digit between 1-9
    let val = input.value.replace(/[^1-9]/g, '');
    input.value = val;

    if (val === '') {
        board[row][col] = 0;
        input.classList.remove('invalid');
        return;
    }

    let num = parseInt(val);
    board[row][col] = num;

    // Real-time validation: check if this number conflicts with sudoku rules
    // Temporarily set cell to 0 while checking, so it doesn't conflict with itself
    board[row][col] = 0;
    let valid = isSafe(board, row, col, num);
    board[row][col] = num;

    if (!valid) {
        input.classList.add('invalid');
        mistakeCount++;
        mistakesDisplay.textContent = mistakeCount;
        showMessage('Oops! That number conflicts with sudoku rules.', 'red');
    } else {
        input.classList.remove('invalid');
        showMessage('', '');
    }

    // Check if the whole puzzle has been completed correctly
    checkIfBoardComplete();
}

// Highlights all cells in the same row, column, and 3x3 box as the selected cell
function highlightRelatedCells(row, col) {
    selectedRow = row;
    selectedCol = col;

    // First remove old highlights
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('highlight'));

    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            let sameRow = (r === row);
            let sameCol = (c === col);
            let sameBox = (r >= boxRowStart && r < boxRowStart + 3 &&
                           c >= boxColStart && c < boxColStart + 3);

            if (sameRow || sameCol || sameBox) {
                getCellElement(r, c).classList.add('highlight');
            }
        }
    }
}


/* ==========================================================================
   SECTION 4: KEYBOARD NAVIGATION (arrow keys + delete/backspace)
   ========================================================================== */

function handleKeyNavigation(e) {
    let row = parseInt(e.target.dataset.row);
    let col = parseInt(e.target.dataset.col);

    if (e.key === 'ArrowUp' && row > 0) {
        moveFocus(row - 1, col);
    } else if (e.key === 'ArrowDown' && row < SIZE - 1) {
        moveFocus(row + 1, col);
    } else if (e.key === 'ArrowLeft' && col > 0) {
        moveFocus(row, col - 1);
    } else if (e.key === 'ArrowRight' && col < SIZE - 1) {
        moveFocus(row, col + 1);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        // Clear the current cell's value (only if it's not a given/locked cell)
        if (!givenCells[row][col]) {
            board[row][col] = 0;
        }
    }
}

// Moves keyboard focus to a specific cell
function moveFocus(row, col) {
    let cell = getCellElement(row, col);
    if (cell) {
        cell.focus();
    }
}


/* ==========================================================================
   SECTION 5: TIMER
   ========================================================================== */

function startTimer() {
    stopTimer();               // make sure no previous timer is still running
    secondsElapsed = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        secondsElapsed++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    let minutes = Math.floor(secondsElapsed / 60);
    let seconds = secondsElapsed % 60;

    // padStart makes sure we always show 2 digits, e.g. "05" instead of "5"
    let minutesStr = String(minutes).padStart(2, '0');
    let secondsStr = String(seconds).padStart(2, '0');

    timerDisplay.textContent = `${minutesStr}:${secondsStr}`;
}


/* ==========================================================================
   SECTION 6: MAIN BUTTON ACTIONS (New Game, Solve, Hint, Reset, Check)
   ========================================================================== */

// Decides how many cells to remove based on chosen difficulty
function getHolesForDifficulty(difficulty) {
    if (difficulty === 'easy') return 35;     // fewer empty cells = easier
    if (difficulty === 'medium') return 45;
    if (difficulty === 'hard') return 55;     // more empty cells = harder
    return 45; // default fallback
}

// Starts a fresh new puzzle
function startNewGame() {
    let difficulty = difficultySelect.value;
    let holes = getHolesForDifficulty(difficulty);

    // Step 1: generate a completely solved board
    solutionBoard = generateSolvedBoard();

    // Step 2: remove some numbers from it to create the playable puzzle
    board = removeNumbers(solutionBoard, holes);

    // Step 3: mark which cells are "given" (fixed clues, not editable)
    givenCells = board.map(row => row.map(value => value !== 0));

    // Reset mistakes and message
    mistakeCount = 0;
    mistakesDisplay.textContent = mistakeCount;
    showMessage('', '');

    renderBoard();
    startTimer();
}

// Solves the current puzzle instantly and displays the full solution
function solvePuzzle() {
    // We already know the solution, so we just show it directly.
    // (We could also re-run solveSudoku() on the current board instead.)
    board = solutionBoard.map(row => [...row]);
    renderBoard();
    stopTimer();
    showMessage('Puzzle Solved!', 'green');
}

// Gives the user one free correct number in a random empty cell
function giveHint() {
    let emptyCells = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }

    if (emptyCells.length === 0) {
        showMessage('No empty cells left for a hint!', 'red');
        return;
    }

    // Pick a random empty cell and fill it with the correct answer
    let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    let { row, col } = randomCell;

    board[row][col] = solutionBoard[row][col];

    let cellElement = getCellElement(row, col);
    cellElement.value = solutionBoard[row][col];
    cellElement.classList.add('hint');

    // Remove the highlight color after a short delay so it feels like a "flash"
    setTimeout(() => cellElement.classList.remove('hint'), 1000);

    showMessage('Hint added!', 'green');
    checkIfBoardComplete();
}

// Resets the board back to only the original given clues (clears user progress)
function resetBoard() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (!givenCells[row][col]) {
                board[row][col] = 0;
            }
        }
    }

    mistakeCount = 0;
    mistakesDisplay.textContent = mistakeCount;
    showMessage('Board has been reset.', 'green');

    renderBoard();
    startTimer();
}

// Manually checks the current board against the solution and shows result
function checkPuzzle() {
    let isComplete = true;
    let isCorrect = true;

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                isComplete = false;
            } else if (board[row][col] !== solutionBoard[row][col]) {
                isCorrect = false;
            }
        }
    }

    if (!isComplete) {
        showMessage('Puzzle is not complete yet.', 'red');
    } else if (isCorrect) {
        showMessage('Correct! Well done!', 'green');
        stopTimer();
    } else {
        showMessage('Some entries are incorrect.', 'red');
    }
}

// Automatically called after every input to silently detect a win
function checkIfBoardComplete() {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] !== solutionBoard[row][col]) {
                return; // not finished / not correct yet
            }
        }
    }

    // If we never returned above, board matches the solution perfectly
    showMessage('Congratulations! You solved the puzzle!', 'green');
    stopTimer();
}

// Small helper to display a message with a given color
function showMessage(text, color) {
    messageDisplay.textContent = text;
    messageDisplay.style.color = color || '#27ae60';
}


/* ==========================================================================
   SECTION 7: EVENT LISTENERS FOR BUTTONS
   ========================================================================== */

newGameBtn.addEventListener('click', startNewGame);
solveBtn.addEventListener('click', solvePuzzle);
hintBtn.addEventListener('click', giveHint);
resetBtn.addEventListener('click', resetBoard);
checkBtn.addEventListener('click', checkPuzzle);


/* ==========================================================================
   SECTION 8: START THE APP
   As soon as the page loads, automatically start a new game
   ========================================================================== */

window.addEventListener('DOMContentLoaded', startNewGame);
