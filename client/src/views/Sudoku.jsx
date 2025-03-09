// Import React Magic
import { useState, useEffect, useRef, useCallback } from "react";

// Import Subcomponents
import Header from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import SudokuBoard from "../components/SudokuGame/SudokuBoard";
import SudokuNumberInput from "../components/SudokuGame/SudokuNumberInput";

// Import Custom Hook
import useTimer from "../customHooks/useTimer";

// Import JSON File Of Puzzles
import puzzleList from "../assets/Json/sudoku_puzzles.json";

export default function SodokuGame({ isTimerPaused, setIsTimerPaused }) {
  // --- Difficulty and Dropdown State ---
  const [difficulty, setDifficulty] = useState(0.4);
  const [difficultyLabel, setDifficultyLabel] = useState("easy");
  const [isOpen, setIsOpen] = useState(false);

  // Create a ref for the dropdown container
  const dropdownRef = useRef(null);
  // Create a ref for the game container (board and number pad)
  const gameContainerRef = useRef(null);

  // --- Board Interaction State ---
  const [activeCell, setActiveCell] = useState(null);
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const difficultyMap = { easy: 0.4, medium: 0.55, hard: 0.7 };

  // --- Dropdown Handlers ---
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (e) => {
      const level = e.target.value;
      const difficultyValue = difficultyMap[level] || 0.4;
      setDifficulty(difficultyValue);
      setDifficultyLabel(level);
      setIsOpen(false);
      newGame(difficultyValue);
    },
    [difficultyMap]
  );

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
      resetTimer();
      setIsRunning(false);
    },
    [difficulty, getRandomPuzzle]
  );

  // --- Board and Game State ---
  const [puzzleData, setPuzzleData] = useState(getRandomPuzzle(difficulty));
  const [board, setBoard] = useState(puzzleData.playable);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);

  // --- Custom Timer Hook ---  
  // Notice: We pass isRunning && !isTimerPaused so that the timer stops when paused.
  const { time, resetTimer } = useTimer(isRunning && !isTimerPaused);

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
    resetTimer();
    setIsRunning(false);
  }, [difficulty, getRandomPuzzle, resetTimer]);

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

  // New win check that validates the complete board independently.
  const checkForWin = useCallback((currentBoard) => {
    // Must be complete.
    if (currentBoard.flat().includes(0)) return false;

    // Helper: Check that group contains exactly the numbers 1-9.
    const isValidGroup = (group) => {
      const groupSet = new Set(group);
      return (
        groupSet.size === 9 &&
        [1, 2, 3, 4, 5, 6, 7, 8, 9].every((num) => groupSet.has(num))
      );
    };

    // Check rows.
    for (let i = 0; i < 9; i++) {
      if (!isValidGroup(currentBoard[i])) return false;
    }

    // Check columns.
    for (let j = 0; j < 9; j++) {
      const col = [];
      for (let i = 0; i < 9; i++) {
        col.push(currentBoard[i][j]);
      }
      if (!isValidGroup(col)) return false;
    }

    // Check 3x3 boxes.
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const box = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            box.push(currentBoard[boxRow * 3 + i][boxCol * 3 + j]);
          }
        }
        if (!isValidGroup(box)) return false;
      }
    }

    return true;
  }, []);

  // --- Board Cell Interaction ---
  const handleCellSelect = useCallback(
    (row, col) => {
      if (!isRunning) setIsRunning(true);
      // If the selected cell is fixed (nonzero in puzzleData.playable), then highlight all its occurrences.
      if (puzzleData.playable[row][col] !== 0) {
        if (highlightedNumber === board[row][col]) {
          setHighlightedNumber(null);
        } else {
          setHighlightedNumber(board[row][col]);
        }
        setActiveCell(null);
        return;
      }
      if (activeCell && activeCell.row === row && activeCell.col === col) {
        setActiveCell(null);
        setHighlightedNumber(null);
        return;
      }
      setActiveCell({ row, col });
      if (board[row][col] !== 0) {
        setHighlightedNumber(board[row][col]);
      } else {
        setHighlightedNumber(null);
      }
    },
    [activeCell, board, highlightedNumber, isRunning, puzzleData]
  );

  // --- Cell Deletion Handler ---
  const handleCellDelete = useCallback(
    (row, col) => {
      // Only allow deletion if the cell is user-entered (i.e. puzzleData.playable is 0)
      if (puzzleData.playable[row][col] !== 0) return;
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = 0;
      setBoard(newBoard);
      validateBoard(newBoard);
      setHighlightedNumber(null);
    },
    [board, puzzleData, validateBoard]
  );

  // --- Number Input Handler ---
  const handleNumberInput = useCallback(
    (num) => {
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
      // If num is 0, treat it as a deletion command.
      if (num === 0) {
        handleCellDelete(row, col);
        return;
      }
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;
      setBoard(newBoard);
      validateBoard(newBoard);
      setActiveCell(null);
      setHighlightedNumber(null);
      if (!errors.size && checkForWin(newBoard)) {
        setShowWinningModal(true);
        setIsRunning(false);
      }
    },
    [
      activeCell,
      board,
      errors,
      checkForWin,
      puzzleData,
      validateBoard,
      highlightedNumber,
      handleCellDelete,
    ]
  );

  // --- Reset Handler ---
  const resetGame = useCallback(() => {
    setBoard(puzzleData.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
    setHighlightedNumber(null);
  }, [puzzleData]);

  // --- Keyboard Listener ---
  const handleKeyDown = useCallback(
    (e) => {
      if (!activeCell) return;
      const { key } = e;
      if (key >= "1" && key <= "9") {
        handleNumberInput(parseInt(key, 10));
      } else if (key === "Backspace" || key === "Delete") {
        const { row, col } = activeCell;
        if (puzzleData.playable[row][col] === 0) {
          handleCellDelete(row, col);
        }
      }
    },
    [activeCell, handleNumberInput, handleCellDelete, puzzleData]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  // --- Close Dropdown and Clear Active Cell When Clicking Outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown if click is outside the dropdown container.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Clear active cell only if click is outside the game container.
      if (gameContainerRef.current && !gameContainerRef.current.contains(event.target)) {
        setActiveCell(null);
        setHighlightedNumber(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main>
      <Header
        title={"Sudoku"}
        onclick={() => newGame()}
        turn_title={"Time"}
        turns={formatTime(time)}
        howTo={`Sudoku is a logic-based puzzle played on a 9x9 grid divided into nine 3x3 regions. Your goal is to fill every row, column, and region with the digits 1 through 9 without repeating any number.

Click on an empty cell to select it and begin inputting a number using either the on-screen number pad or your keyboard. If you click on a cell that already contains a user-entered number, that cell becomes active for editing and all instances of that number will be highlighted in green. Clicking the same active cell a second time will release it. Fixed numbers (those given at the start) cannot be edited, but clicking one will highlight all of its occurrences (a second click will release the highlight).

To delete a number from an active cell, simply double-click the cell, press the delete/backspace key, or click the 'X' button in the number pad. Good luck and happy puzzling!`}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />
      {/* RESET AND DIFFICULTY SELECTION */}
      <div className="button_box">
        <div className="dropdown_container" ref={dropdownRef}>
          <div
            className={`dropdown_select ${isOpen ? "open" : ""}`}
            onClick={handleToggle}
          >
            {difficultyLabel.charAt(0).toUpperCase() +
              difficultyLabel.slice(1)}
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
      <div ref={gameContainerRef}>
        <SudokuBoard
          board={board}
          puzzleData={puzzleData}
          activeCell={activeCell}
          highlightedNumber={highlightedNumber}
          handleCellSelect={handleCellSelect}
          handleCellDelete={handleCellDelete} // deletion handler for board cells
          lastTapRef={lastTapRef}
          errors={errors}
        />
        <SudokuNumberInput
          activeCell={activeCell}
          highlightedNumber={highlightedNumber}
          handleNumberInput={handleNumberInput}
          handleDelete={handleCellDelete} // deletion handler for the "X" button
          isNumberLocked={isNumberLocked}
          puzzleId={puzzleData.id}
        />
      </div>
      {showWinningModal && (
        <WinningModal
          message1="You solved the puzzle in"
          turns={formatTime(time)}
          onClose={() => newGame()}
        />
      )}
    </main>
  );
}
