export type Board = number[][];

export type Difficulty = "easy" | "medium" | "hard";

function createEmptyBoard(): Board {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function shuffle(numbers: number[]): number[] {
    const array = [...numbers];

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

export function isValidMove(
    board: Board,
    row: number,
    col: number,
    num: number
): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
        if (c !== col && board[row][c] === num) {
            return false;
        }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
        if (r !== row && board[r][col] === num) {
            return false;
        }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            if ((r !== row || c !== col) && board[r][c] === num) {
                return false;
            }
        }
    }

    return true;
}

function solveBoard(board: Board): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffle([
                    1, 2, 3, 4, 5, 6, 7, 8, 9,
                ]);

                for (const num of numbers) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;

                        if (solveBoard(board)) {
                            return true;
                        }

                        board[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}

function createSolvedBoard(): Board {
    const board = createEmptyBoard();

    solveBoard(board);

    return board;
}

function getCellsToRemove(
    difficulty: Difficulty
): number {
    switch (difficulty) {
        case "easy":
            return 35;

        case "medium":
            return 45;

        case "hard":
            return 55;

        default:
            return 45;
    }
}

function createPuzzle(
    solution: Board,
    difficulty: Difficulty
): Board {
    const puzzle = solution.map((row) => [...row]);

    const cellsToRemove =
        getCellsToRemove(difficulty);

    const positions = shuffle(
        Array.from({ length: 81 }, (_, index) => index)
    );

    for (let i = 0; i < cellsToRemove; i++) {
        const position = positions[i];

        const row = Math.floor(position / 9);
        const col = position % 9;

        puzzle[row][col] = 0;
    }

    return puzzle;
}

export function generateSudoku(
    difficulty: Difficulty
): {
    puzzle: Board;
    solution: Board;
} {
    const solution = createSolvedBoard();

    const puzzle = createPuzzle(
        solution,
        difficulty
    );

    return {
        puzzle,
        solution,
    };
}

export function isBoardComplete(
    board: Board
): boolean {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const num = board[row][col];

            if (num === 0) {
                return false;
            }

            if (!isValidMove(board, row, col, num)) {
                return false;
            }
        }
    }

    return true;
}