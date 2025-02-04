import { useState, useEffect, useRef } from "react";
import Header from "../components/GameHeader/GameHeader";
import WinningModal from "../components/Modals/WinningModal";
import puzzleList from "../assets/Json/sudoku_puzzles.json";

export default function SodokuGame() {
  // Difficulty state (numeric value and label)
  const [difficulty, setDifficulty] = useState(0.4);
  const [difficultyLabel, setDifficultyLabel] = useState("easy");
  const [isOpen, setIsOpen] = useState(false);
  
  // Active cell state: { row, col } or null
  const [activeCell, setActiveCell] = useState(null);

  // Mapping from lower-case difficulty string to numeric value.
  const difficultyMap = { easy: 0.4, medium: 0.55, hard: 0.7 };

  // Toggle dropdown open/closed.
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Handle selecting a difficulty from the dropdown.
  const handleSelect = (e) => {
    const level = e.target.value;
    const difficultyValue = difficultyMap[level] || 0.4;
    setDifficulty(difficultyValue);
    setDifficultyLabel(level);
    setIsOpen(false);
    newGame(difficultyValue);
  };

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

  // Create a new game using the provided difficulty or the current state.
  const newGame = (updatedDifficulty) => {
    const difficultyLevel = updatedDifficulty ?? difficulty;
    const newPuzzle = getRandomPuzzle(difficultyLevel);
    setPuzzleData(newPuzzle);
    setBoard(newPuzzle.playable);
    // Clear win modal and errors.
    setShowWinningModal(false);
    setErrors(new Set());
    // Clear any active cell.
    setActiveCell(null);
    // Note: The timer is not reset here so that the clock remains consistent 
    // until the first interaction of a new game.
    setIsRunning(false);
  };

  // Game board state and related states.
  const [puzzleData, setPuzzleData] = useState(getRandomPuzzle(difficulty));
  const [board, setBoard] = useState(puzzleData.playable);
  const [timer, setTimer] = useState(0);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);

  // Ref for handling touch double-tap.
  const lastTapRef = useRef(0);

  // When difficulty changes, load a new puzzle.
  useEffect(() => {
    const newPuzzle = getRandomPuzzle(difficulty);
    setPuzzleData(newPuzzle);
    setBoard(newPuzzle.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
    setIsRunning(false);
  }, [difficulty]);

  // Timer effect: starts incrementing once isRunning is true.
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

  // Called when a board cell is clicked. Only editable cells (value 0 in puzzleData.playable) may become active.
  const handleCellSelect = (row, col) => {
    if (puzzleData.playable[row][col] !== 0) return;
    if (!isRunning) setIsRunning(true);
    setActiveCell({ row, col });
  };

  // Called when a number (1-9) or delete ("X") is pressed (via buttons or keyboard). (0 indicates deletion.)
  const handleNumberInput = (num) => {
    if (activeCell === null) return;
    const { row, col } = activeCell;
    if (puzzleData.playable[row][col] !== 0) return;
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num; // 0 for deletion.
    setBoard(newBoard);
    validateBoard(newBoard);
    if (num !== 0) {
      setActiveCell(null);
    }
    if (!errors.size && checkForWin(newBoard)) {
      setShowWinningModal(true);
      setIsRunning(false);
    }
  };

  // Reset the board to the original playable puzzle.
  // (This does not restart or pause the clock.)
  const resetGame = () => {
    setBoard(puzzleData.playable);
    setShowWinningModal(false);
    setErrors(new Set());
    setActiveCell(null);
  };

  // Listen for keydown events for number inputs and deletion.
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

  // Helper: check if a number is "locked" (used properly in the board).
  // A number is locked if it appears exactly 9 times, and each row and column
  // contains that number exactly once.
  const isNumberLocked = (num) => {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === num) count++;
      }
    }
    if (count !== 9) return false;
    // Check each row.
    for (let row = 0; row < 9; row++) {
      const rowCount = board[row].filter((cell) => cell === num).length;
      if (rowCount !== 1) return false;
    }
    // Check each column.
    for (let col = 0; col < 9; col++) {
      let colCount = 0;
      for (let row = 0; row < 9; row++) {
        if (board[row][col] === num) colCount++;
      }
      if (colCount !== 1) return false;
    }
    return true;
  };

  return (
    <main>
      <Header
        title={"Sudoku"}
        onclick={() => newGame()}
        turn_title={"Time"}
        turns={formatTime(timer)}
        howTo={"Add game play info here."}
      />
      <div className="button_box">
        {/* Custom dropdown for selecting difficulty */}
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
        {/* Reset button */}
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
            // Each cell will render only its right and bottom borders.
            // Use 5px for the gap between blocks:
            // - If this cell is in column 3 or 6 (0-indexed: colIndex == 2 or 5), its right border is 5px.
            // - Otherwise, if it’s not the last column, use 2px.
            const borderRight =
              colIndex === 8
                ? "0" // Outer border is handled by container.
                : (colIndex === 2 || colIndex === 5)
                ? "5px"
                : "2px";
            // Similarly for the bottom border:
            const borderBottom =
              rowIndex === 8
                ? "0" // Outer border is handled by container.
                : (rowIndex === 2 || rowIndex === 5)
                ? "5px"
                : "2px";

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
              color:
                errors.has(`${rowIndex}-${colIndex}`) &&
                board[rowIndex][colIndex] !== 0
                  ? "red"
                  : puzzleData.playable[rowIndex][colIndex] !== 0
                  ? "#0073e6"
                  : "#000",
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
            // justifyContent: "space-evenly",
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
                onClick={() => !locked && handleNumberInput(num)}
                disabled={locked}
                style={{
                  color: locked ? "grey" : "#991843",
                  fontWeight: "800",
                  fontSize: "18px",
                  width: "38px",
                  height: "38px",
                }}
              >
                {num}
              </button>
            );
          })}
          <button
            onClick={() => handleNumberInput(0)}
            style={{
              color: "#991843",
              fontWeight: "900",
              width: "38px",
              height: "38px",
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
