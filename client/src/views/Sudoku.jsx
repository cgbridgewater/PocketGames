import { useState, useEffect, useRef } from "react";
import Header from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import puzzleList from "../assets/Json/sudoku_puzzles.json";

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

  // Mapping of difficulty strings to numeric values.
  const difficultyMap = { easy: 0.4, medium: 0.55, hard: 0.7 };

  // --- Dropdown Handlers ---
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  const handleSelect = (e) => {
    const level = e.target.value;
    const difficultyValue = difficultyMap[level] || 0.4;
    setDifficulty(difficultyValue);
    setDifficultyLabel(level);
    setIsOpen(false);
    newGame(difficultyValue);
  };

  // --- Puzzle Generation ---
  const getRandomPuzzle = (difficultyLevel) => {
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
  };

  // --- New Game Handler ---
  // When a new game is started (or difficulty changes), we reset the board and clock.
  const newGame = (updatedDifficulty) => {
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
  };

  // --- Board and Game State ---
  const [puzzleData, setPuzzleData] = useState(getRandomPuzzle(difficulty));
  const [board, setBoard] = useState(puzzleData.playable);
  const [timer, setTimer] = useState(0);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);

  // --- Ref for Touch Handling ---
  const lastTapRef = useRef(0);

  // When difficulty changes, load a new puzzle.
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
  }, [difficulty]);

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
  const validateBoard = (newBoard) => {
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
  };

  const areBoardsEqual = (board1, board2) => {
    return (
      board1.length === board2.length &&
      board1.every((row, rowIndex) =>
        row.length === board2[rowIndex].length &&
        row.every((cell, colIndex) => cell === board2[rowIndex][colIndex])
      )
    );
  };

  const checkForWin = (currentBoard) => {
    if (currentBoard.flat().includes(0)) return false;
    return areBoardsEqual(currentBoard, puzzleData.solved);
  };

  // --- Board Cell Interaction ---
  // Clicking any board cell starts the clock.
  // * Fixed cells (preset): clicking toggles highlight.
  // * Editable cells:
  //   - First click selects the cell (active) and, if it already contains a number, highlights that number.
  //   - A second click on the same active cell releases it.
  const handleCellSelect = (row, col) => {
    if (!isRunning) setIsRunning(true); // Start clock on any board cell click.
    // Fixed cell: preset value from puzzleData.playable is nonzero.
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
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      // Second click on same cell: release it.
      setActiveCell(null);
      setHighlightedNumber(null);
      return;
    }
    // Otherwise, select this cell for editing.
    setActiveCell({ row, col });
    // If the cell already has a user-entered number, highlight it.
    if (board[row][col] !== 0) {
      setHighlightedNumber(board[row][col]);
    } else {
      setHighlightedNumber(null);
    }
  };

  // --- Number Input Handler ---
  // If a cell is active, input the number (or delete with 0) and clear highlight.
  // If no cell is active, toggle highlight on the input button.
  const handleNumberInput = (num) => {
    if (activeCell === null) {
      // Toggle highlight: if already highlighted with this number, clear it.
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
    newBoard[row][col] = num; // 0 means deletion.
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
  };

  // --- Reset Handler ---
  // Reset the board to the original playable puzzle WITHOUT resetting the clock.
  const resetGame = () => {
    setBoard(puzzleData.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
    setHighlightedNumber(null);
  };

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
  }, [activeCell, board, errors, isRunning]);

  // --- Helper: Check if a number is locked ---
  // A number is locked if it appears exactly 9 times and each row and column contains it exactly once.
  const isNumberLocked = (num) => {
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
  };

  // --- Clear Active Selection if Clicking Off the Board ---
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
        howTo={"Add game play info here."}
      />
      <div className="button_box">
        <div className="dropdown-container">
          <div
            className={`dropdown-select ${isOpen ? "open" : ""}`}
            onClick={handleToggle}
          >
            {difficultyLabel.charAt(0).toUpperCase() +
              difficultyLabel.slice(1)}
          </div>
          {isOpen && (
            <div className="dropdown-options">
              {["easy", "medium", "hard"].map((level) => (
                <div
                  key={level}
                  className="dropdown-option"
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
      {/* Board container with a 5px outer border */}
      <div
        style={{
          margin: "8px auto 4px",
          display: "grid",
          gridTemplateColumns: "repeat(9, 39px)",
          gap: "0px",
          width: "fit-content",
          border: "5px solid #991843",
          backgroundColor: "#991843",
          boxSizing: "border-box",
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            // For inner dividers:
            // Right border: if not the last column, use 5px if colIndex is 2 or 5; otherwise 2px.
            const borderRight =
              colIndex === 8 ? "0" : (colIndex === 2 || colIndex === 5 ? "5px" : "2px");
            // Bottom border: if not the last row, use 5px if rowIndex is 2 or 5; otherwise 2px.
            const borderBottom =
              rowIndex === 8 ? "0" : (rowIndex === 2 || rowIndex === 5 ? "5px" : "2px");

            const cellStyle = {
              boxSizing: "border-box",
              borderTop: "none",
              borderLeft: "none",
              borderRight: `${borderRight} solid #991843`,
              borderBottom: `${borderBottom} solid #991843`,
              width: "38px",
              height: "38px",
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "800",
              outline: "none",
              cursor:
                puzzleData.playable[rowIndex][colIndex] !== 0
                  ? "default"
                  : "pointer",
              backgroundColor:
                activeCell &&
                activeCell.row === rowIndex &&
                activeCell.col === colIndex
                  ? "#E5D5D5"
                  : "#fff",
              // If the cell's value equals the highlighted number, display green.
              color:
                board[rowIndex][colIndex] === highlightedNumber
                  ? "green"
                  : errors.has(`${rowIndex}-${colIndex}`) &&
                    board[rowIndex][colIndex] !== 0
                  ? "red"
                  : puzzleData.playable[rowIndex][colIndex] !== 0
                  ? "#0073e6"
                  : "#000",
              // Prevent text selection while dragging.
              userSelect: "none",
            };

            return (
              <input
                key={`${rowIndex}-${colIndex}`}
                type="text"
                readOnly
                value={cell !== 0 ? cell : ""}
                onClick={() => handleCellSelect(rowIndex, colIndex)}
                onTouchEnd={() => {
                  const now = Date.now();
                  if (now - lastTapRef.current < 300) {
                    handleCellSelect(rowIndex, colIndex);
                  }
                  lastTapRef.current = now;
                }}
                onMouseDown={(e) => e.preventDefault()}
                style={cellStyle}
              />
            );
          })
        )}
      </div>
      <div className="numbers_box" style={{ margin: "0 auto" }}>
        <div
          className="number_inputs"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2px",
            width: "351px",
            margin: "0 auto",
            border: "5px solid #991843",
            backgroundColor: "#991843",
          }}
        >
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
                style={{
                  color: locked
                    ? "grey"
                    : num === highlightedNumber
                    ? "green"
                    : "#991843",
                  fontWeight: "800",
                  fontSize: "18px",
                  width: "38px",
                  height: "38px",
                  outline: "none"
                }}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={() =>
              activeCell ? handleNumberInput(0) : highlightedNumber === 0 ? setHighlightedNumber(null) : setHighlightedNumber(0)
            }
            style={{
              color: "#991843",
              fontWeight: "900",
              fontSize: "18px",
              width: "38px",
              height: "38px",
              outline: "none"
            }}
          >
            X
          </button>
        </div>
        <p
          style={{
            fontSize: "0.5rem",
            fontWeight: "bold",
            color: "#991843",
            marginTop: "4px",
          }}
        >
          Puzzle #{puzzleData.id}
        </p>
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
