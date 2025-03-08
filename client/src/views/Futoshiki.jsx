// src/components/Futoshiki.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import puzzles from '../assets/Json/FutoshikiPuzzles.json';
import Header from '../components/GameHeader/GameHeader';
import WinningModal from "../components/Modals/WinningModal";
import { validateGrid } from '../components/FutoshikiGame/utils/validation';
import useTimer from "../customHooks/useTimer";

// Helper: draw a rounded rectangle that can be filled and stroked.
const drawRoundedRect = (ctx, x, y, width, height, radius, fillStyle, strokeStyle) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
  }
};

const Futoshiki = ({ isTimerPaused, setIsTimerPaused }) => {
  const canvasRef = useRef(null);
  const dropdownRef = useRef(null);
  const lastTapRef = useRef({ time: 0, cell: null }); // For double-tap detection

  // Puzzle and game state.
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [givens, setGivens] = useState([]);
  const [cellStatus, setCellStatus] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);

  // Difficulty dropdown state.
  const [difficulty, setDifficulty] = useState("easy");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Timer: runs only when board is interacted with.
  const { time, resetTimer } = useTimer(!isTimerPaused);

  // Dimensions.
  const cellSize = 50;
  const outerGap = 8;       // gap around the board.
  const innerGap = 20;      // gap between cells.
  const puzzleRows = 5;     // puzzle board rows.
  const keypadRows = 1;     // keypad is 1 row.
  const totalRows = puzzleRows + keypadRows;
  const gapBetween = innerGap;  // gap between puzzle board and keypad.
  const separatorHeight = 1;    // 1px separator line.
  
  const puzzleBoardHeight = puzzleRows * cellSize + (puzzleRows - 1) * innerGap;
  const keypadHeight = cellSize; // height of keypad row.
  const canvasWidth = outerGap * 2 + 5 * cellSize + (5 - 1) * innerGap;
  const canvasHeight = outerGap * 2 + puzzleBoardHeight + gapBetween + separatorHeight + keypadHeight;

  // Define sizeVal (board size) early.
  const sizeVal = puzzle ? puzzle.size : 5;

  // Helper: Format time as mm:ss.
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to initialize a puzzle.
  const initPuzzle = useCallback(() => {
    if (puzzles && puzzles.puzzles && puzzles.puzzles.length > 0) {
      const randomIndex = Math.floor(Math.random() * puzzles.puzzles.length);
      const selectedPuzzle = puzzles.puzzles[randomIndex];
      setPuzzle(selectedPuzzle);
      const size = selectedPuzzle.size;
      const currentGivens = selectedPuzzle.givens[difficulty] || [];
      const givensBool = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
      const initialGrid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
      currentGivens.forEach(coord => {
        const [r, c] = coord;
        givensBool[r][c] = true;
        initialGrid[r][c] = selectedPuzzle.solution[r][c];
      });
      setGivens(givensBool);
      setGrid(initialGrid);
      setCellStatus(Array.from({ length: size }, () => Array.from({ length: size }, () => 'blue')));
      setSelectedCell(null);
      setIsWinningModalOpen(false);
      setIsTimerPaused(true);
    }
  }, [puzzles, difficulty, setIsTimerPaused]);

  useEffect(() => {
    initPuzzle();
    resetTimer();
  }, [initPuzzle, resetTimer]);

  // Validate grid.
  useEffect(() => {
    if (puzzle) {
      const status = validateGrid(grid, givens, puzzle.inequalities);
      setCellStatus(status);
    }
  }, [grid, givens, puzzle]);

  // Check win condition.
  useEffect(() => {
    if (!puzzle) return;
    const allFilled = grid.every(row => row.every(cell => cell !== null));
    const hasError = cellStatus.some(row => row.some(status => status === 'red'));
    if (allFilled && !hasError) {
      setIsWinningModalOpen(true);
      setIsTimerPaused(true);
    }
  }, [grid, cellStatus, puzzle, setIsTimerPaused]);

  // newGame: Called from Header and Winning Modal.
  const newGame = () => {
    resetTimer();
    if (puzzle) {
      let newPuzzle = puzzle;
      if (puzzles.puzzles.length > 1) {
        while (newPuzzle.id === puzzle.id) {
          const randomIndex = Math.floor(Math.random() * puzzles.puzzles.length);
          newPuzzle = puzzles.puzzles[randomIndex];
        }
      } else {
        newPuzzle = puzzles.puzzles[0];
      }
      setPuzzle(newPuzzle);
      const size = newPuzzle.size;
      const currentGivens = newPuzzle.givens[difficulty] || [];
      const givensBool = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
      const initialGrid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
      currentGivens.forEach(coord => {
        const [r, c] = coord;
        givensBool[r][c] = true;
        initialGrid[r][c] = newPuzzle.solution[r][c];
      });
      setGivens(givensBool);
      setGrid(initialGrid);
      setCellStatus(Array.from({ length: size }, () => Array.from({ length: size }, () => 'blue')));
      setSelectedCell(null);
      setIsWinningModalOpen(false);
      setIsTimerPaused(true);
    } else {
      initPuzzle();
      setIsTimerPaused(true);
    }
  };

  // clearBoard: Called from the Button Box "Reset" button.
  const clearBoard = () => {
    if (!puzzle) return;
    const size = puzzle.size;
    const currentGivens = puzzle.givens[difficulty] || [];
    const givensBool = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
    const initialGrid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
    currentGivens.forEach(coord => {
      const [r, c] = coord;
      givensBool[r][c] = true;
      initialGrid[r][c] = puzzle.solution[r][c];
    });
    setGivens(givensBool);
    setGrid(initialGrid);
    setCellStatus(Array.from({ length: size }, () => Array.from({ length: size }, () => 'blue')));
    setSelectedCell(null);
    setIsWinningModalOpen(false);
    // Timer continues running.
  };

  // Difficulty Dropdown Handlers.
  const handleToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelect = (event) => {
    const level = event.target.value;
    setDifficulty(level);
    setIsDropdownOpen(false);
    clearBoard();
  };

  // Handle canvas cell selection (puzzle board and keypad).
  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !puzzle) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    if (isTimerPaused) {
      setIsTimerPaused(false);
    }
    
    let tappedRow = -1, tappedCol = -1;
    // Check puzzle board area.
    for (let r = 0; r < puzzleRows; r++) {
      let rowY = outerGap + r * (cellSize + innerGap);
      if (clickY >= rowY && clickY < rowY + cellSize) {
        tappedRow = r;
        break;
      }
    }
    // If not in puzzle board, check keypad area.
    if (tappedRow === -1) {
      const puzzleBoardBottom = outerGap + puzzleBoardHeight;
      const sepY = puzzleBoardBottom + gapBetween / 2 - 0.5;
      const keypadY = puzzleBoardBottom + gapBetween + separatorHeight;
      if (clickY >= keypadY && clickY < keypadY + keypadHeight) {
        tappedRow = puzzleRows; // keypad row index
      }
    }
    // Determine column.
    for (let c = 0; c < sizeVal; c++) {
      let colX = outerGap + c * (cellSize + innerGap);
      if (clickX >= colX && clickX < colX + cellSize) {
        tappedCol = c;
        break;
      }
    }
    if (tappedRow === -1 || tappedCol === -1) {
      setSelectedCell(null);
      return;
    }
    if (tappedRow < puzzleRows) {
      // Puzzle board cell.
      const currentTime = Date.now();
      if (
        lastTapRef.current.cell &&
        lastTapRef.current.cell[0] === tappedRow &&
        lastTapRef.current.cell[1] === tappedCol &&
        currentTime - lastTapRef.current.time < 300
      ) {
        // Double-tap: delete.
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(r => r.slice());
          newGrid[tappedRow][tappedCol] = null;
          return newGrid;
        });
        lastTapRef.current = { time: 0, cell: null };
      } else {
        setSelectedCell([tappedRow, tappedCol]);
        lastTapRef.current = { time: currentTime, cell: [tappedRow, tappedCol] };
      }
    } else {
      // Keypad tapped.
      handleNumberButton(tappedCol + 1);
      setSelectedCell(null);
    }
  };

  // Handle on-screen number button clicks.
  const handleNumberButton = (num) => {
    if (selectedCell && puzzle && selectedCell[0] < puzzleRows) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.slice());
        newGrid[selectedCell[0]][selectedCell[1]] = num;
        return newGrid;
      });
    }
  };

  // Keyboard number entry.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedCell || !puzzle) return;
      const [row, col] = selectedCell;
      const key = event.key;
      const regex = new RegExp(`^[1-${sizeVal}]$`);
      if (regex.test(key)) {
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(r => r.slice());
          newGrid[row][col] = parseInt(key, 10);
          return newGrid;
        });
      }
      if (key === 'Backspace' || key === 'Delete') {
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(r => r.slice());
          newGrid[row][col] = null;
          return newGrid;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, puzzle, sizeVal]);

  // Redraw canvas.
  useEffect(() => {
    if (!canvasRef.current || !puzzle) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw overall background.
    ctx.fillStyle = '#242424';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw puzzle board.
    for (let r = 0; r < puzzleRows; r++) {
      for (let c = 0; c < sizeVal; c++) {
        const cellX = outerGap + c * (cellSize + innerGap);
        const cellY = outerGap + r * (cellSize + innerGap);
        let fillColor = 'rgb(229,213,213)';
        if (cellStatus[r][c] === 'green') {
          fillColor = 'rgb(153,247,153)';
        } else if (cellStatus[r][c] === 'red') {
          fillColor = 'rgb(254, 127, 127)';
        }
        drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 4, fillColor, 'black');
        const value = grid[r][c];
        if (value !== null) {
          ctx.fillStyle = '#000';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(value, cellX + cellSize / 2, cellY + cellSize / 2);
        }
      }
    }

    // Draw separator line between puzzle board and keypad.
    const puzzleBoardBottom = outerGap + puzzleBoardHeight;
    const sepY = puzzleBoardBottom + gapBetween / 2 - 3;
    ctx.fillStyle = '#D9B14B';
    ctx.fillRect(0, sepY, canvasWidth, 4);

    // Draw keypad background (6th row) spanning full width.
    const keypadY = puzzleBoardBottom + gapBetween + separatorHeight;
    ctx.fillStyle = '#991843';
    ctx.fillRect(0, 349, canvasWidth, 100);

    // Draw keypad cells.
    for (let c = 0; c < sizeVal; c++) {
      const keyCellX = outerGap + c * (cellSize + innerGap);
      const keyCellY = keypadY;
      drawRoundedRect(ctx, keyCellX, keyCellY, cellSize, cellSize, 4, '#E5D5D5', 'black');
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c + 1, keyCellX + cellSize / 2, keyCellY + cellSize / 2);
    }

    // Draw inequality symbols for puzzle board.
    puzzle.inequalities.forEach(ineq => {
      const { cell1, cell2, operator } = ineq;
      const [r1, c1] = cell1;
      const [r2, c2] = cell2;
      const cell1X = outerGap + c1 * (cellSize + innerGap);
      const cell1Y = outerGap + r1 * (cellSize + innerGap);
      const cell2X = outerGap + c2 * (cellSize + innerGap);
      const cell2Y = outerGap + r2 * (cellSize + innerGap);
      let textX, textY;
      if (r1 === r2) { // Horizontal inequality.
        if (c1 < c2) {
          textX = cell1X + cellSize + innerGap / 2;
          textY = cell1Y + cellSize / 2;
        } else {
          textX = cell2X + cellSize + innerGap / 2;
          textY = cell2Y + cellSize / 2;
        }
        ctx.fillStyle = '#E5D5D5';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(operator, textX, textY);
      } else if (c1 === c2) { // Vertical inequality.
        let rotation;
        if (r1 < r2) {
          textX = cell1X + cellSize / 2;
          textY = cell1Y + cellSize + innerGap / 2;
          rotation = Math.PI / 2;
        } else {
          textX = cell2X + cellSize / 2;
          textY = cell2Y + cellSize + innerGap / 2;
          rotation = -Math.PI / 2;
        }
        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(rotation);
        ctx.fillStyle = '#E5D5D5';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(operator, 0, 0);
        ctx.restore();
      } else {
        textX = (cell1X + cell2X) / 2;
        textY = (cell1Y + cell2Y) / 2;
        ctx.fillStyle = '#E5D5D5';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(operator, textX, textY);
      }
    });

    // Highlight selected cell (puzzle board only).
    if (selectedCell && selectedCell[0] < puzzleRows) {
      const [r, c] = selectedCell;
      const cellX = outerGap + c * (cellSize + innerGap);
      const cellY = outerGap + r * (cellSize + innerGap);
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 4, null, 'orange');
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }
  }, [grid, cellStatus, selectedCell, puzzle, canvasWidth, canvasHeight, cellSize, innerGap, outerGap, sizeVal, puzzleBoardHeight, gapBetween, keypadHeight, separatorHeight, puzzleRows]);

  return (
    <main>
      {/* HEADER COMPONENT: onclick triggers newGame */}
      <Header 
        title={"Futoshiki"} 
        onclick={newGame}
        turn_title={"Time"}
        turns={formatTime(time)}
        howTo={
          "Fill each row and column with the numbers 1 to 5 without repeating numbers, and making sure all inequality constraints between cells are satisfied.\n\n Select a cell to enter a number with the pink numbers from the bottom row. \n\n  Double tapping, Backspace or Delete can be used to clear a cell.\n\n Green cells cannot be changed and red cells indicate an error.  \n\n The puzzle is solved when every cell is correctly filled. \n\n Use the reset button to clear the board \n\n Select the difficulty to adjust it"
        }
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      {/* Button Box with Difficulty Dropdown and CLEAR BOARD Reset Button */}
      <div className="button_box" style={{ margin: "-8px auto 0"}}>
        <div className="dropdown_container" ref={dropdownRef}>
          <div
            className={`dropdown_select ${isDropdownOpen ? "open" : ""}`}
            onClick={handleToggle}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </div>
          {isDropdownOpen && (
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
        <button onClick={clearBoard}>Reset</button>
      </div>

      {/* GamePlay Canvas */}
      {puzzle ? (
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ border: '4px solid #D9B14B', borderRadius: "8px", margin: "8px" }}
          onClick={handleCanvasClick}
        />
      ) : (
        <div>Loading puzzle...</div>
      )}

      {/* Display Puzzle ID */}
      {puzzle && <p style={{ textAlign: 'center' }}>Puzzle number: {puzzle.id}</p>}

      {/* Winning Modal: onClose triggers newGame */}
      {isWinningModalOpen && (
        <WinningModal 
          message1={"Winner! Time to complete "}
          message2={""}
          turns={formatTime(time)}
          onClose={newGame} 
        />
      )}
    </main>
  );
};

export default Futoshiki;
