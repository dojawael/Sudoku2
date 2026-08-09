"use client";

import { useEffect, useState } from "react";

import {
  type Board,
  type Difficulty,
  generateSudoku,
  isBoardComplete,
} from "./lib/sudoku";

import { initializePOWR } from "./lib/powr";

const MAX_MISTAKES = 4;

export default function Home() {
  // POWR
  const [powr, setPowr] = useState<any>(null);

  const [puzzle, setPuzzle] = useState<Board>([]);
  const [solution, setSolution] = useState<Board>([]);
  const [board, setBoard] = useState<Board>([]);

  const [selected, setSelected] = useState<
    [number, number] | null
  >(null);

  const [wrongCell, setWrongCell] = useState<
    [number, number] | null
  >(null);

  const [mistakes, setMistakes] = useState<number>(0);

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [seconds, setSeconds] = useState<number>(0);

  const [paused, setPaused] = useState<boolean>(false);

  const [gameOver, setGameOver] = useState<boolean>(false);

  const [showCongratulations, setShowCongratulations] =
    useState<boolean>(false);

  const [showGameOver, setShowGameOver] =
    useState<boolean>(false);

  const [message, setMessage] = useState<string>("");

  function startNewGame(
    level: Difficulty = difficulty
  ): void {
    const game = generateSudoku(level);

    setPuzzle(game.puzzle);
    setSolution(game.solution);

    setBoard(
      game.puzzle.map((row) => [...row])
    );

    setSelected(null);
    setWrongCell(null);
    setMistakes(0);
    setSeconds(0);
    setPaused(false);
    setGameOver(false);
    setShowCongratulations(false);
    setShowGameOver(false);
    setMessage("");
  }

  // Start Sudoku
  useEffect(() => {
    startNewGame("medium");
  }, []);

  // Initialize POWR
  useEffect(() => {
    async function initPOWR() {
      const client = await initializePOWR();

      if (client) {
        setPowr(client);

        console.log(
          "POWR initialized successfully"
        );

        if (client.player) {
          console.log(
            "Player:",
            client.player.username
          );
        }
      }
    }

    initPOWR();
  }, []);

  // Timer
  useEffect(() => {
    if (paused || gameOver) {
      return;
    }

    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [paused, gameOver]);

  function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(
      2,
      "0"
    )}`;
  }

  function changeDifficulty(
    level: Difficulty
  ): void {
    setDifficulty(level);
    startNewGame(level);
  }

  function selectCell(
    row: number,
    col: number
  ): void {
    if (paused || gameOver) {
      return;
    }

    setSelected([row, col]);
    setMessage("");
    setWrongCell(null);
  }

  // Submit completed Sudoku result to POWR
  async function submitPOWRResult(): Promise<void> {
    if (!powr) {
      console.log(
        "No POWR session. Result was not submitted."
      );
      return;
    }

    try {
      const score = Math.max(
        0,
        1000 -
        seconds * 2 -
        mistakes * 100
      );

      const result = await powr.results.submit({
        score,
        win: true,
        completed: true,
        duration: seconds,

        customStats: {
          difficulty,
          mistakes,
          time: seconds,
        },
      });

      console.log(
        "POWR result submitted successfully:",
        result
      );

      console.log(
        `XP earned: ${result.xpEarned}`
      );

      console.log(
        `Coins earned: ${result.coinsEarned}`
      );

      console.log(
        `New level: ${result.newLevel}`
      );

      console.log(
        `Streak: ${result.streak}`
      );

    } catch (error) {
      console.error(
        "Failed to submit POWR result:",
        error
      );
    }
  }

  async function enterNumber(
    number: number
  ): Promise<void> {
    if (
      paused ||
      gameOver ||
      !selected
    ) {
      return;
    }

    const [row, col] = selected;

    // Original puzzle cells cannot be changed.
    if (puzzle[row][col] !== 0) {
      setMessage(
        "This cell cannot be changed."
      );
      return;
    }

    // Wrong number
    if (number !== solution[row][col]) {
      const newMistakes = mistakes + 1;

      setMistakes(newMistakes);
      setWrongCell([row, col]);

      setMessage("❌ Wrong number!");

      setTimeout(() => {
        setWrongCell(null);
      }, 500);

      // 4th mistake = Game Over
      if (
        newMistakes >= MAX_MISTAKES
      ) {
        setGameOver(true);
        setShowGameOver(true);
        setMessage("");

        // Submit failed game to POWR
        if (powr) {
          try {
            const score = Math.max(
              0,
              1000 -
              seconds * 2 -
              newMistakes * 100
            );

            const result =
              await powr.results.submit({
                score,
                win: false,
                completed: false,
                duration: seconds,

                customStats: {
                  difficulty,
                  mistakes: newMistakes,
                  time: seconds,
                  reason: "too_many_mistakes",
                },
              });

            console.log(
              "POWR game-over result submitted:",
              result
            );
          } catch (error) {
            console.error(
              "Failed to submit game-over result:",
              error
            );
          }
        }

        return;
      }

      return;
    }

    // Correct number
    const newBoard: Board = board.map(
      (currentRow) => [...currentRow]
    );

    newBoard[row][col] = number;

    setBoard(newBoard);
    setMessage("");

    // Check if puzzle is complete
    if (isBoardComplete(newBoard)) {
      setGameOver(true);
      setShowCongratulations(true);

      console.log(
        "Sudoku completed in:",
        formatTime(seconds)
      );

      // Submit successful result to POWR
      await submitPOWRResult();
    }
  }

  function clearCell(): void {
    if (
      paused ||
      gameOver ||
      !selected
    ) {
      return;
    }

    const [row, col] = selected;

    // Original puzzle cells cannot be cleared.
    if (puzzle[row][col] !== 0) {
      return;
    }

    const newBoard: Board = board.map(
      (currentRow) => [...currentRow]
    );

    newBoard[row][col] = 0;

    setBoard(newBoard);
    setMessage("");
  }

  // Keyboard controls
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ): void {
      if (
        paused ||
        gameOver ||
        !selected
      ) {
        return;
      }

      const [row, col] = selected;

      // Numbers 1-9
      if (
        event.key >= "1" &&
        event.key <= "9"
      ) {
        event.preventDefault();

        void enterNumber(
          Number(event.key)
        );

        return;
      }

      // Delete / Backspace / 0
      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        event.preventDefault();

        clearCell();

        return;
      }

      // Arrow Up
      if (event.key === "ArrowUp") {
        event.preventDefault();

        setSelected([
          Math.max(0, row - 1),
          col,
        ]);

        return;
      }

      // Arrow Down
      if (event.key === "ArrowDown") {
        event.preventDefault();

        setSelected([
          Math.min(8, row + 1),
          col,
        ]);

        return;
      }

      // Arrow Left
      if (event.key === "ArrowLeft") {
        event.preventDefault();

        setSelected([
          row,
          Math.max(0, col - 1),
        ]);

        return;
      }

      // Arrow Right
      if (event.key === "ArrowRight") {
        event.preventDefault();

        setSelected([
          row,
          Math.min(8, col + 1),
        ]);

        return;
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selected,
    paused,
    gameOver,
    board,
    puzzle,
    solution,
    mistakes,
    difficulty,
    seconds,
    powr,
  ]);

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto">

        {/* Header */}

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-900">
            Sudoku
          </h1>

          <p className="text-slate-500 mt-2">
            Complete the puzzle
          </p>
        </div>

        {/* Difficulty */}

        <div className="flex justify-center gap-2 mb-5">
          {(
            [
              "easy",
              "medium",
              "hard",
            ] as Difficulty[]
          ).map((level) => (
            <button
              key={level}
              onClick={() =>
                changeDifficulty(level)
              }
              className={`
                px-4
                py-2
                rounded-lg
                font-semibold
                capitalize
                transition

                ${difficulty === level
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-200"
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Game Card */}

        <div className="bg-white rounded-2xl shadow-xl p-5">

          {/* Timer + Mistakes */}

          <div className="flex items-center justify-between mb-5">

            <div>
              <p className="text-sm text-slate-500">
                Time
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {formatTime(seconds)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">
                Mistakes
              </p>

              <p
                className={`
                  text-2xl
                  font-bold
                  ${mistakes >= 3
                    ? "text-red-600"
                    : "text-slate-900"
                  }
                `}
              >
                {mistakes}/3
              </p>
            </div>

          </div>

          {/* Pause */}

          <div className="flex justify-center mb-5">
            <button
              onClick={() =>
                setPaused(
                  (value) => !value
                )
              }
              disabled={gameOver}
              className="
                px-5
                py-2
                rounded-lg
                bg-slate-900
                text-white
                font-semibold
                hover:bg-slate-800
                disabled:opacity-50
              "
            >
              {paused
                ? "Resume"
                : "Pause"}
            </button>
          </div>

          {/* Paused Message */}

          {paused && !gameOver && (
            <div
              className="
                mb-4
                rounded-lg
                bg-yellow-100
                text-yellow-800
                text-center
                py-2
                font-semibold
              "
            >
              Game Paused
            </div>
          )}

          {/* Sudoku Board */}

          <div className="mx-auto w-fit border-2 border-slate-900">

            {board.map(
              (row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex"
                >

                  {row.map(
                    (
                      value,
                      colIndex
                    ) => {

                      const isSelected =
                        selected?.[0] ===
                        rowIndex &&
                        selected?.[1] ===
                        colIndex;

                      const isWrong =
                        wrongCell?.[0] ===
                        rowIndex &&
                        wrongCell?.[1] ===
                        colIndex;

                      const isFixed =
                        puzzle[rowIndex][
                        colIndex
                        ] !== 0;

                      const thickRight =
                        colIndex === 2 ||
                        colIndex === 5;

                      const thickBottom =
                        rowIndex === 2 ||
                        rowIndex === 5;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() =>
                            selectCell(
                              rowIndex,
                              colIndex
                            )
                          }
                          disabled={
                            paused ||
                            gameOver
                          }
                          className={`
                            w-10
                            h-10
                            sm:w-12
                            sm:h-12

                            flex
                            items-center
                            justify-center

                            text-lg
                            font-semibold

                            border
                            border-slate-300

                            transition-all
                            duration-150

                            ${thickRight
                              ? "border-r-2 border-r-slate-900"
                              : ""
                            }

                            ${thickBottom
                              ? "border-b-2 border-b-slate-900"
                              : ""
                            }

                            ${isWrong
                              ? "bg-red-200 text-red-700 ring-2 ring-red-500"
                              : isSelected
                                ? "bg-blue-200"
                                : isFixed
                                  ? "bg-slate-100 text-slate-900"
                                  : "bg-white text-blue-600 hover:bg-blue-50"
                            }

                            ${paused
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                            }
                          `}
                        >
                          {value === 0
                            ? ""
                            : value}
                        </button>
                      );
                    }
                  )}

                </div>
              )
            )}

          </div>

          {/* Wrong Number Message */}

          {message && (
            <div
              className="
                mt-4
                text-center
                font-semibold
                text-red-600
              "
            >
              {message}
            </div>
          )}

          {/* Number Pad */}

          <div className="grid grid-cols-5 gap-2 mt-5">

            {[
              1, 2, 3, 4, 5,
              6, 7, 8, 9,
            ].map((number) => (
              <button
                key={number}
                onClick={() =>
                  void enterNumber(number)
                }
                disabled={
                  paused ||
                  gameOver
                }
                className="
                  h-11
                  rounded-lg
                  bg-blue-600
                  text-white
                  font-bold
                  hover:bg-blue-700
                  active:scale-95
                  transition
                  disabled:opacity-50
                "
              >
                {number}
              </button>
            ))}

            <button
              onClick={clearCell}
              disabled={
                paused ||
                gameOver
              }
              className="
                h-11
                rounded-lg
                bg-slate-200
                text-slate-800
                font-bold
                hover:bg-slate-300
                active:scale-95
                transition
                disabled:opacity-50
              "
            >
              Clear
            </button>

          </div>

          {/* Keyboard Help */}

          <div className="mt-5 text-center text-xs text-slate-400">
            Use <b>1–9</b> to enter numbers
            {" • "}
            <b>Arrow Keys</b> to move
            {" • "}
            <b>Delete</b> to clear
          </div>

          {/* New Game */}

          <button
            onClick={() =>
              startNewGame()
            }
            className="
              w-full
              mt-4
              h-12
              rounded-lg
              bg-slate-900
              text-white
              font-bold
              hover:bg-slate-800
              transition
            "
          >
            New Game
          </button>

        </div>
      </div>

      {/* Congratulations Popup */}

      {showCongratulations && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              bg-white
              p-8
              text-center
              shadow-2xl
            "
          >

            <div className="text-6xl mb-4">
              🎉
            </div>

            <h2
              className="
                text-3xl
                font-bold
                text-slate-900
                mb-2
              "
            >
              Congratulations!
            </h2>

            <p className="text-slate-500 mb-2">
              You solved the Sudoku!
            </p>

            <p
              className="
                text-lg
                font-semibold
                text-slate-700
                mb-6
              "
            >
              Time: {formatTime(seconds)}
            </p>

            <button
              onClick={() =>
                startNewGame()
              }
              className="
                w-full
                h-12
                rounded-xl
                bg-blue-600
                text-white
                font-bold
                hover:bg-blue-700
                transition
              "
            >
              New Game
            </button>

          </div>
        </div>
      )}

      {/* Game Over Popup */}

      {showGameOver && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              bg-white
              p-8
              text-center
              shadow-2xl
            "
          >

            <div className="text-6xl mb-4">
              😔
            </div>

            <h2
              className="
                text-3xl
                font-bold
                text-slate-900
                mb-2
              "
            >
              Game Over
            </h2>

            <p className="text-slate-500 mb-6">
              You made 4 mistakes.
            </p>

            <button
              onClick={() =>
                startNewGame()
              }
              className="
                w-full
                h-12
                rounded-xl
                bg-blue-600
                text-white
                font-bold
                hover:bg-blue-700
                transition
              "
            >
              Try Again
            </button>

          </div>
        </div>
      )}

    </main>
  );
}