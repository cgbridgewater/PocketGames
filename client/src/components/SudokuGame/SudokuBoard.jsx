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
            colIndex === 8 ? "0" : (colIndex === 2 || colIndex === 5 ? "5px" : "2px");
          const borderBottom =
            rowIndex === 8 ? "0" : (rowIndex === 2 || rowIndex === 5 ? "5px" : "2px");
          const dynamicStyle = {
            borderRight: `${borderRight} solid #991843`,
            borderBottom: `${borderBottom} solid #991843`,
            backgroundColor:
              activeCell &&
              activeCell.row === rowIndex &&
              activeCell.col === colIndex
                ? "#E5D5D5"
                : "#EFEFEF",
            color:
              board[rowIndex][colIndex] === highlightedNumber
                ? "green"
                : errors.has(`${rowIndex}-${colIndex}`) && board[rowIndex][colIndex] !== 0
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
