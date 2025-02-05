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

          // Set background color:
          // Active cell gets a dark grey background,
          // Highlighted (non-active) cells get a green background,
          // Otherwise, use the default background.
          const backgroundColor = isActive
            ? "darkgrey"
            : isHighlighted
            ? "lightgreen"
            : "#EFEFEF";

          // Determine text color:
          // If there is an error and the cell is not empty, use red.
          // Otherwise, if the cell is fixed (non-zero in puzzleData.playable), use blue.
          // Otherwise, use black.
          const textColor =
            errors.has(`${rowIndex}-${colIndex}`) && board[rowIndex][colIndex] !== 0
              ? "red"
              : puzzleData.playable[rowIndex][colIndex] !== 0
              ? "#0073e6"
              : "#000";

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
