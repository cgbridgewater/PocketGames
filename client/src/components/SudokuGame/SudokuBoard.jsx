import React from "react";

export default function SudokuBoard({
  board,
  puzzleData,
  activeCell,
  highlightedNumber,
  handleCellSelect,
  lastTapRef,
  errors,
}) {
  return (
    <div className="sudoku_board_container">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          // Calculate dynamic borders for inner dividers:
          const borderRight =
            colIndex === 8 ? "0" : colIndex === 2 || colIndex === 5 ? "5px" : "2px";
          const borderBottom =
            rowIndex === 8 ? "0" : rowIndex === 2 || rowIndex === 5 ? "5px" : "2px";

          // Determine if the cell is active or highlighted.
          const isActive =
            activeCell &&
            activeCell.row === rowIndex &&
            activeCell.col === colIndex;
          const isHighlighted =
            highlightedNumber !== null && board[rowIndex][colIndex] === highlightedNumber;

          // Check if this cell is in error.
          const hasError = errors.has(`${rowIndex}-${colIndex}`) && board[rowIndex][colIndex] !== 0;

          // Set the background color.
          // If there's an error, background is yellow.
          // Otherwise, active cells are dark grey, highlighted cells are green,
          // and all other cells use the default background.
          let backgroundColor;
          if (hasError) {
            backgroundColor = "#fffaaa";
          } else if (isActive) {
            backgroundColor = "darkgrey";
          } else if (isHighlighted) {
            backgroundColor = "lightgreen";
          } else {
            backgroundColor = "#EFEFEF";
          }

          // Determine text color:
          // Fixed cells (given in puzzleData.playable) are blue,
          // while user–entered numbers are black.
          const textColor =
            puzzleData.playable[rowIndex][colIndex] !== 0 ? "#242424" : "#0073e6";

          const dynamicStyle = {
            borderRight: `${borderRight} solid #991843`,
            borderBottom: `${borderBottom} solid #991843`,
            backgroundColor,
            color: textColor,
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
  );
}
