import { useState, useEffect, useRef, useCallback } from "react";
import Header from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import puzzleList from "../assets/Json/sudoku_puzzles.json";

// Constants for styling and dimensions
const BORDER_COLOR = "#991843";
const FIXED_COLOR = "#0073e6";
const ERROR_COLOR = "red";
const HIGHLIGHT_COLOR = "green";
const ACTIVE_BG = "#E5D5D5";
const EMPTY_BG = "#EFEFEF";

export default function SodokuGame() {
  // --- Difficulty and Dropdown State ---
  const [difficulty, setDifficulty] = useState(0.4);
  const [difficultyLabel, setDifficultyLabel] = useState("easy");
  const [isOpen, setIsOpen] = useState(false);

  // --- Board Interaction State ---
  // activeCell holds {row, col} if a cell is being edited.
  // highlightedNumber is used to highlight all occurrences of a number.
  const [activeCell, setActiveCell] = useState(null);
  const [highlightedNumber, setHighlightedNumber] = useState(null);

  const difficultyMap = { easy: 0.4, medium: 0.55, hard: 0.7 };

  // --- Dropdown Handlers ---
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback((e) => {
    const level = e.target.value;
    const difficultyValue = difficultyMap[level] || 0.4;
    setDifficulty(difficultyValue);
    setDifficultyLabel(level);
    setIsOpen(false);
    newGame(difficultyValue);
  }, [difficultyMap]);

  // --- Puzzle Generation ---
  const getRandomPuzzle = useCallback(
    (difficultyLevel) => {
      const puzzleIndex = Math.floor(Math.random() * puzzleList.length);
      const solvedPuzzle = puzzleList[puzzleIndex];
      const playablePuzzle = solvedPuzzle.solution.map((row) =>
        row.map((cell) => (Math.random() < difficultyLevel ? 0 : cell))
      );
      return {
        id: solvedPuzzle.id,
        solved: solvedPuzzle.solution,
        playable: playablePuzzle,
      };
    },
    []
  );

  // --- New Game Handler ---
  const newGame = useCallback(
    (updatedDifficulty) => {
      const difficultyLevel = updatedDifficulty ?? difficulty;
      const newPuzzle = getRandomPuzzle(difficultyLevel);
      setPuzzleData(newPuzzle);
      setBoard(newPuzzle.playable);
      setShowWinningModal(false);
      setErrors(new Set());
      setActiveCell(null);
      setHighlightedNumber(null);
      setTimer(0); // Reset the clock.
      setIsRunning(false);
    },
    [difficulty, getRandomPuzzle]
  );

  // --- Board and Game State ---
  const [puzzleData, setPuzzleData] = useState(getRandomPuzzle(difficulty));
  const [board, setBoard] = useState(puzzleData.playable);
  const [timer, setTimer] = useState(0);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);

  // --- Ref for Touch Handling ---
  const lastTapRef = useRef(0);

  // When difficulty changes, reset the board.
  useEffect(() => {
    const newPuzzle = getRandomPuzzle(difficulty);
    setPuzzleData(newPuzzle);
    setBoard(newPuzzle.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
    setHighlightedNumber(null);
    setTimer(0);
    setIsRunning(false);
  }, [difficulty, getRandomPuzzle]);

  // --- Timer Effect ---
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // --- Board Validation and Win Check ---
  const validateBoard = useCallback((newBoard) => {
    let errorPositions = new Set();
    for (let i = 0; i < 9; i++) {
      let rowSet = new Map();
      let colSet = new Map();
      for (let j = 0; j < 9; j++) {
        let rowValue = newBoard[i][j];
        let colValue = newBoard[j][i];
        if (rowValue !== 0) {
          if (rowSet.has(rowValue)) {
            errorPositions.add(`${i}-${j}`);
            errorPositions.add(`${i}-${rowSet.get(rowValue)}`);
          } else {
            rowSet.set(rowValue, j);
          }
        }
        if (colValue !== 0) {
          if (colSet.has(colValue)) {
            errorPositions.add(`${j}-${i}`);
            errorPositions.add(`${colSet.get(colValue)}-${i}`);
          } else {
            colSet.set(colValue, j);
          }
        }
      }
    }
    setErrors(errorPositions);
  }, []);

  const areBoardsEqual = useCallback((board1, board2) => {
    return (
      board1.length === board2.length &&
      board1.every((row, rowIndex) =>
        row.length === board2[rowIndex].length &&
        row.every((cell, colIndex) => cell === board2[rowIndex][colIndex])
      )
    );
  }, []);

  const checkForWin = useCallback(
    (currentBoard) => {
      if (currentBoard.flat().includes(0)) return false;
      return areBoardsEqual(currentBoard, puzzleData.solved);
    },
    [areBoardsEqual, puzzleData]
  );

  // --- Board Cell Interaction ---
  const handleCellSelect = useCallback(
    (row, col) => {
      // Clicking any board cell starts the clock.
      if (!isRunning) setIsRunning(true);
      // If the cell is fixed (preset), toggle highlight.
      if (puzzleData.playable[row][col] !== 0) {
        if (highlightedNumber === board[row][col]) {
          setHighlightedNumber(null);
        } else {
          setHighlightedNumber(board[row][col]);
        }
        setActiveCell(null);
        return;
      }
      // Editable cell:
      // If the cell is already active, release it (clear active and highlight).
      if (activeCell && activeCell.row === row && activeCell.col === col) {
        setActiveCell(null);
        setHighlightedNumber(null);
        return;
      }
      // Otherwise, select the cell for editing.
      setActiveCell({ row, col });
      // If it already contains a user-input number, highlight it.
      if (board[row][col] !== 0) {
        setHighlightedNumber(board[row][col]);
      } else {
        setHighlightedNumber(null);
      }
    },
    [activeCell, board, highlightedNumber, isRunning, puzzleData]
  );

  // --- Number Input Handler ---
  const handleNumberInput = useCallback(
    (num) => {
      // If no cell is active, toggle the highlight on the input button.
      if (activeCell === null) {
        if (highlightedNumber === num) {
          setHighlightedNumber(null);
        } else {
          setHighlightedNumber(num);
        }
        return;
      }
      const { row, col } = activeCell;
      if (puzzleData.playable[row][col] !== 0) return;
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num; // 0 indicates deletion.
      setBoard(newBoard);
      validateBoard(newBoard);
      if (num !== 0) {
        setActiveCell(null);
      }
      setHighlightedNumber(null);
      if (!errors.size && checkForWin(newBoard)) {
        setShowWinningModal(true);
        setIsRunning(false);
      }
    },
    [activeCell, board, errors, checkForWin, puzzleData, validateBoard, highlightedNumber]
  );

  // --- Reset Handler ---
  // Resets the board (clearing inputs) without resetting the clock.
  const resetGame = useCallback(() => {
    setBoard(puzzleData.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
    setHighlightedNumber(null);
  }, [puzzleData]);

  // --- Keyboard Listener ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeCell) return;
      const { key } = e;
      if (key >= "1" && key <= "9") {
        handleNumberInput(parseInt(key, 10));
      } else if (key === "Backspace" || key === "Delete") {
        handleNumberInput(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCell, handleNumberInput]);

  // --- Helper: Check if a Number is Locked ---
  const isNumberLocked = useCallback(
    (num) => {
      let count = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === num) count++;
        }
      }
      if (count !== 9) return false;
      for (let row = 0; row < 9; row++) {
        const rowCount = board[row].filter((cell) => cell === num).length;
        if (rowCount !== 1) return false;
      }
      for (let col = 0; col < 9; col++) {
        let colCount = 0;
        for (let row = 0; row < 9; row++) {
          if (board[row][col] === num) colCount++;
        }
        if (colCount !== 1) return false;
      }
      return true;
    },
    [board]
  );

  // --- Clear Active Selection When Clicking Off the Board ---
  const handleMainClick = (e) => {
    if (e.target === e.currentTarget) {
      setActiveCell(null);
      setHighlightedNumber(null);
    }
  };

  return (
    <main onClick={handleMainClick}>
      <Header
        title={"Sudoku"}
        onclick={() => newGame()}
        turn_title={"Time"}
        turns={formatTime(timer)}
        howTo={`Sudoku is a logic-based puzzle played on a 9x9 grid divided into nine 3x3 regions. Your goal is to fill every row, column, and region with the digits 1 through 9 without repeating any number. \n
          Click on an empty cell to select it and begin inputting a number using either the on-screen number pad or your keyboard. If you click on a cell that already contains a user-entered number, that cell becomes active for editing and all instances of that number will be highlighted in green. Clicking the same active cell a second time will release it. Fixed numbers (those given at the start) cannot be edited, but clicking one will highlight all of its occurrences. \n
          To delete a number from an active cell, simply double-click the cell, press the delete/backspace key, or click the 'X' button in the number pad.
          Good luck and happy puzzling!`}
      />
      <div className="button_box">
        <div className="dropdown_container">
          <div
            className={`dropdown_select ${isOpen ? "open" : ""}`}
            onClick={handleToggle}
          >
            {difficultyLabel.charAt(0).toUpperCase() + difficultyLabel.slice(1)}
          </div>
          {isOpen && (
            <div className="dropdown_options">
              {["easy", "medium", "hard"].map((level) => (
                <div
                  key={level}
                  className="dropdown_option"
                  onClick={() => {
                    handleSelect({ target: { value: level } });
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={resetGame}>Reset</button>
      </div>
      {/* --- Sudoku Board Container --- */}
      <div className="sudoku_board_container">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // Compute dynamic borders based on cell position.
            const borderRight =
              colIndex === 8
                ? "0"
                : colIndex === 2 || colIndex === 5
                ? "5px"
                : "2px";
            const borderBottom =
              rowIndex === 8
                ? "0"
                : rowIndex === 2 || rowIndex === 5
                ? "5px"
                : "2px";

            const dynamicStyle = {
              borderRight: `${borderRight} solid ${BORDER_COLOR}`,
              borderBottom: `${borderBottom} solid ${BORDER_COLOR}`,
              backgroundColor:
                activeCell &&
                activeCell.row === rowIndex &&
                activeCell.col === colIndex
                  ? ACTIVE_BG
                  : EMPTY_BG,
              // If the cell's value equals the highlighted number, use green text.
              color:
                board[rowIndex][colIndex] === highlightedNumber
                  ? HIGHLIGHT_COLOR
                  : errors.has(`${rowIndex}-${colIndex}`) &&
                    board[rowIndex][colIndex] !== 0
                  ? ERROR_COLOR
                  : puzzleData.playable[rowIndex][colIndex] !== 0
                  ? FIXED_COLOR
                  : "#000",
            };

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                readOnly
                value={cell !== 0 ? cell : ""}
                className="sudoku_cell"
                onClick={() => handleCellSelect(rowIndex, colIndex)}
                onTouchEnd={() => {
                  const now = Date.now();
                  if (now - lastTapRef.current < 300) {
                    handleCellSelect(rowIndex, colIndex);
                  }
                  lastTapRef.current = now;
                }}
                onMouseDown={(e) => e.preventDefault()}
                style={dynamicStyle}
              />
            );
          })
        )}
      </div>
      {/* --- Sudoku Number Input Row --- */}
      <div className="sudoku_numbers_box">
        <div className="sudoku_number_inputs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const locked = isNumberLocked(num);
            return (
              <button
                key={num}
                onClick={() =>
                  activeCell
                    ? handleNumberInput(num)
                    : highlightedNumber === num
                    ? setHighlightedNumber(null)
                    : setHighlightedNumber(num)
                }
                disabled={locked}
                className="sudoku_number_button"
                style={{
                  color:
                    locked
                      ? "grey"
                      : num === highlightedNumber
                      ? "green"
                      : BORDER_COLOR,
                }}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={() =>
              activeCell
                ? handleNumberInput(0)
                : highlightedNumber === 0
                ? setHighlightedNumber(null)
                : setHighlightedNumber(0)
            }
            className="sudoku_number_button"
            style={{
              color: BORDER_COLOR,
            }}
          >
            X
          </button>
        </div>
        <p className="sudoku_puzzle_id">Puzzle #{puzzleData.id}</p>
      </div>
      {showWinningModal && (
        <WinningModal
          message1="You solved the puzzle in"
          turns={formatTime(timer)}
          onClose={() => newGame()}
        />
      )}
    </main>
  );
}
