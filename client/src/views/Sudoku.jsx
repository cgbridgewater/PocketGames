// Import React Magic
import { useState, useEffect, useRef, useCallback } from "react";

// Import Subcomponents
import Header from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import SudokuBoard from "../components/SudokuGame/SudokuBoard";
import SudokuNumberInput from "../components/SudokuGame/SudokuNumberInput";

// Import Custom Hook
import useTimer from "../components/SudokuGame/hooks/useTimer";

// Import JSON File Of Puzzles
import puzzleList from "../assets/Json/sudoku_puzzles.json";

// --- Constants for Dynamic Styling ---
const BORDER_COLOR = "#991843";
const FIXED_COLOR = "#0073e6";
const ERROR_COLOR = "red";
const HIGHLIGHT_COLOR = "green";
const ACTIVE_BG = "dark grey";
const EMPTY_BG = "#EFEFEF";

export default function SodokuGame() {
  // --- Difficulty and Dropdown State ---
  const [difficulty, setDifficulty] = useState(0.4);
  const [difficultyLabel, setDifficultyLabel] = useState("easy");
  const [isOpen, setIsOpen] = useState(false);

  // Create a ref for the dropdown container
  const dropdownRef = useRef(null);

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
  const { time, resetTimer } = useTimer(isRunning);

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
      if (!isRunning) setIsRunning(true);
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
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;
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
        handleNumberInput(0);
      }
    },
    [activeCell, handleNumberInput]
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


  // --- Close Dropdown And Active Cell When Clicking Outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the click is outside the dropdown container, close the dropdown.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
        howTo={`Sudoku is a logic-based puzzle played on a 9x9 grid divided into nine 3x3 regions. Your goal is to fill every row, column, and region with the digits 1 through 9 without repeating any number.\n\nClick on an empty cell to select it and begin inputting a number using either the on-screen number pad or your keyboard. If you click on a cell that already contains a user-entered number, that cell becomes active for editing and all instances of that number will be highlighted in green. Clicking the same active cell a second time will release it. Fixed numbers (those given at the start) cannot be edited, but clicking one will highlight all of its occurrences (a second click will release the highlight).\n\nTo delete a number from an active cell, simply double-click the cell, press the delete/backspace key, or click the 'X' button in the number pad. Good luck and happy puzzling!`}
      />
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
      <SudokuBoard
        board={board}
        puzzleData={puzzleData}
        activeCell={activeCell}
        highlightedNumber={highlightedNumber}
        handleCellSelect={handleCellSelect}
        lastTapRef={lastTapRef}
        errors={errors}
      />
      <SudokuNumberInput
        activeCell={activeCell}
        highlightedNumber={highlightedNumber}
        handleNumberInput={handleNumberInput}
        isNumberLocked={isNumberLocked}
        puzzleId={puzzleData.id}
      />
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
