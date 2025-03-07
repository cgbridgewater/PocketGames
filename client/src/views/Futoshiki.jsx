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
  // Initially set to "easy".
  const [difficulty, setDifficulty] = useState("easy");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Timer: will run only when board is interacted with.
  const { time, resetTimer } = useTimer(!isTimerPaused);

  // Dimensions.
  const cellSize = 50;
  const outerGap = 8;  // gap around the board.
  const innerGap = 20; // gap between cells.

  // Helper: Format time as mm:ss.
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to initialize a puzzle.
  // Uses the current 'difficulty' state to choose which givens to display.
  const initPuzzle = useCallback(() => {
    if (puzzles && puzzles.puzzles && puzzles.puzzles.length > 0) {
      const randomIndex = Math.floor(Math.random() * puzzles.puzzles.length);
      const selectedPuzzle = puzzles.puzzles[randomIndex];
      setPuzzle(selectedPuzzle);
      const size = selectedPuzzle.size;
      // Use the difficulty-specific givens.
      const currentGivens = selectedPuzzle.givens[difficulty] || [];
      const givensBool = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => false)
      );
      const initialGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null)
      );
      currentGivens.forEach(coord => {
        const [r, c] = coord;
        givensBool[r][c] = true;
        initialGrid[r][c] = selectedPuzzle.solution[r][c];
      });
      setGivens(givensBool);
      setGrid(initialGrid);
      setCellStatus(
        Array.from({ length: size }, () =>
          Array.from({ length: size }, () => 'blue')
        )
      );
      setSelectedCell(null);
      setIsWinningModalOpen(false);
      // Set timer paused until first interaction.
      setIsTimerPaused(true);
    }
  }, [puzzles, difficulty, setIsTimerPaused]);

  // Run initPuzzle once on mount.
  useEffect(() => {
    initPuzzle();
    resetTimer();
  }, [initPuzzle, resetTimer]);

  // Board size value.
  const sizeVal = puzzle ? puzzle.size : 5;
  // Canvas overall size.
  const canvasSize = outerGap * 2 + sizeVal * cellSize + (sizeVal - 1) * innerGap;

  // Validate grid on change.
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
      setIsTimerPaused(true); // pause timer on win.
    }
  }, [grid, cellStatus, puzzle, setIsTimerPaused]);

  // newGame: Called from Header and Winning Modal.
  // Starts a new puzzle (ensuring it's not the same as the current one), resets timer, and closes win modal.
  // The timer remains paused until board interaction.
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
      const givensBool = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => false)
      );
      const initialGrid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => null)
      );
      currentGivens.forEach(coord => {
        const [r, c] = coord;
        givensBool[r][c] = true;
        initialGrid[r][c] = newPuzzle.solution[r][c];
      });
      setGivens(givensBool);
      setGrid(initialGrid);
      setCellStatus(
        Array.from({ length: size }, () =>
          Array.from({ length: size }, () => 'blue')
        )
      );
      setSelectedCell(null);
      setIsWinningModalOpen(false);
      // Keep timer paused until board interaction.
      setIsTimerPaused(true);
    } else {
      initPuzzle();
      setIsTimerPaused(true);
    }
  };

  // clearBoard: Called from the Button Box "Reset" button.
  // Clears the current board (restores givens) but keeps the same puzzle and continues the timer.
  const clearBoard = () => {
    if (!puzzle) return;
    const size = puzzle.size;
    const currentGivens = puzzle.givens[difficulty] || [];
    const givensBool = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false)
    );
    const initialGrid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );
    currentGivens.forEach(coord => {
      const [r, c] = coord;
      givensBool[r][c] = true;
      initialGrid[r][c] = puzzle.solution[r][c];
    });
    setGivens(givensBool);
    setGrid(initialGrid);
    setCellStatus(
      Array.from({ length: size }, () =>
        Array.from({ length: size }, () => 'blue')
      )
    );
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
    // Update the board for the new difficulty.
    clearBoard();
  };

  // Handle canvas cell selection with double-tap detection.
  const handleCanvasClick = (event) => {
    if (!canvasRef.current || !puzzle) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Unpause timer on first board interaction.
    if (isTimerPaused) {
      setIsTimerPaused(false);
    }
    
    // Loop through cells.
    let tappedCell = null;
    for (let r = 0; r < sizeVal; r++) {
      for (let c = 0; c < sizeVal; c++) {
        const cellX = outerGap + c * (cellSize + innerGap);
        const cellY = outerGap + r * (cellSize + innerGap);
        if (
          clickX >= cellX &&
          clickX <= cellX + cellSize &&
          clickY >= cellY &&
          clickY <= cellY + cellSize
        ) {
          tappedCell = [r, c];
          break;
        }
      }
      if (tappedCell) break;
    }
    if (tappedCell) {
      // Check for double-tap.
      const currentTime = Date.now();
      if (
        lastTapRef.current.cell &&
        lastTapRef.current.cell[0] === tappedCell[0] &&
        lastTapRef.current.cell[1] === tappedCell[1] &&
        currentTime - lastTapRef.current.time < 300
      ) {
        // Double-tap: delete number.
        setGrid(prevGrid => {
          const newGrid = prevGrid.map(r => r.slice());
          newGrid[tappedCell[0]][tappedCell[1]] = null;
          return newGrid;
        });
        lastTapRef.current = { time: 0, cell: null };
      } else {
        // Single tap: select the cell.
        setSelectedCell(tappedCell);
        lastTapRef.current = { time: currentTime, cell: tappedCell };
      }
    } else {
      // If tapped off board, clear selection.
      setSelectedCell(null);
    }
  };

  // Handle keyboard number entry.
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

  // Function to handle on-screen number button clicks.
  const handleNumberButton = (num) => {
    if (selectedCell && puzzle) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => r.slice());
        newGrid[selectedCell[0]][selectedCell[1]] = num;
        return newGrid;
      });
    }
  };

  // Redraw canvas.
  useEffect(() => {
    if (!canvasRef.current || !puzzle) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw background.
    ctx.fillStyle = '#242424';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw each cell.
    for (let r = 0; r < sizeVal; r++) {
      for (let c = 0; c < sizeVal; c++) {
        const cellX = outerGap + c * (cellSize + innerGap);
        const cellY = outerGap + r * (cellSize + innerGap);
        let fillColor = 'rgba(229,213,213,1)'; // default for user entries.
        if (cellStatus[r][c] === 'green') {
          fillColor = 'rgb(153,247,153)'; // givens.
        } else if (cellStatus[r][c] === 'red') {
          fillColor = 'rgb(255,108,108)'; // errors.
        }
        drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 4, fillColor, 'black');

        // Render number if present.
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

    // Draw inequality symbols.
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
          // For vertical inequality where top cell < bottom cell,
          // rotate by +90° so that a "<" becomes a downward arrow.
          rotation = Math.PI / 2;
        } else {
          textX = cell2X + cellSize / 2;
          textY = cell2Y + cellSize + innerGap / 2;
          // For vertical inequality where top cell > bottom cell,
          // rotate by -90° so that a ">" becomes an upward arrow.
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
        // Diagonal or non-aligned case.
        textX = (cell1X + cell2X) / 2;
        textY = (cell1Y + cell2Y) / 2;
        ctx.fillStyle = '#E5D5D5';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(operator, textX, textY);
      }
    });

    // Highlight selected cell.
    if (selectedCell) {
      const [r, c] = selectedCell;
      const cellX = outerGap + c * (cellSize + innerGap);
      const cellY = outerGap + r * (cellSize + innerGap);
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 2;
      drawRoundedRect(ctx, cellX, cellY, cellSize, cellSize, 4, null, 'orange');
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'black';
    }
  }, [grid, cellStatus, selectedCell, puzzle, canvasSize, cellSize, innerGap, outerGap, sizeVal]);

  return (
    <main>
      {/* HEADER COMPONENT: onclick triggers newGame */}
      <Header 
        title={"Futoshiki"} 
        onclick={newGame}
        turn_title={"Time"}
        turns={formatTime(time)}
        howTo={
          "Fill each row and column with unique numbers from 1 to 5 while respecting the inequality constraints between cells. Click a cell (that is not a given) and type a number or use Backspace/Delete. Double tap to delete a number. The game is won when all cells are correctly filled."
        }
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      {/* Button Box with Difficulty Dropdown and CLEAR BOARD Reset Button */}
      <div className="button_box">
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
          width={canvasSize}
          height={canvasSize}
          style={{ border: '4px solid #D9B14B', borderRadius: "8px", margin: "16px" }}
          onClick={handleCanvasClick}
        />
      ) : (
        <div>Loading puzzle...</div>
      )}

      {/* Custom Number Keypad for Mobile */}
      <div className="number-keypad" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#991843', border: '1px solid #D9B14B', borderRadius: '8px', padding: '8px', margin: '0 16px' }}>
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => handleNumberButton(num)}
            style={{
              width: '40px',
              height: '40px',
              margin: '0 4px',
              backgroundColor: '#E5D5D5',
              color: '#242424',
              fontSize: '16px',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Display Puzzle ID */}
      {puzzle && <p style={{ textAlign: 'center' }}>Puzzle number: {puzzle.id}</p>}

      {/* Winning Modal: onClose triggers newGame */}
      {isWinningModalOpen && (
        <WinningModal 
          message1={"Winner! solved in- "}
          message2={""}
          turns={formatTime(time)}
          onClose={newGame} 
        />
      )}
    </main>
  );
};

export default Futoshiki;
