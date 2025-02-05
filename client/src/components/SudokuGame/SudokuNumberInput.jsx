import React from "react";

export default function SudokuNumberInput({
  activeCell,
  highlightedNumber,
  handleNumberInput,
  isNumberLocked,
  puzzleId,
  // Optional prop: an array of numbers that are in error.
  errorNumbers = [],
}) {
  return (
    <div className="sudoku_numbers_box">
      <div className="sudoku_number_inputs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const locked = isNumberLocked(num);
          // Check if this number appears in an error cell.
          const isError = errorNumbers.includes(num);
          // Set background: if error, yellow; else if highlighted, green; otherwise default.
          const backgroundColor = isError
            ? "#fffaaa"
            : num === highlightedNumber
            ? "lightgreen"
            : "";
          const textColor = locked ? "grey" : "#991843";
          return (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={locked}
              className="sudoku_number_button"
              style={{
                backgroundColor,
                color: textColor,
                border: "none"
              }}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={() => handleNumberInput(0)}
          className="sudoku_number_button"
          style={{ color: "#991843",border: "none" }}
        >
          X
        </button>
      </div>
      <p className="sudoku_puzzle_id">Puzzle #{puzzleId}</p>
    </div>
  );
}
