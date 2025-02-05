import React from "react";

export default function SudokuNumberInput({
  activeCell,
  highlightedNumber,
  handleNumberInput,
  isNumberLocked,
  puzzleId,
}) {
  return (
    <div className="sudoku_numbers_box">
      <div className="sudoku_number_inputs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const locked = isNumberLocked(num);
          return (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              disabled={locked}
              className="sudoku_number_button"
              style={{
                backgroundColor: num === highlightedNumber ? "lightgreen" : "",
                border: "none",
                color: locked ? "grey" : "#991843",
              }}
            >
              {num}
            </button>
          );
        })}
        <button
          onClick={() => handleNumberInput(0)}
          className="sudoku_number_button"
          style={{ color: "#991843" }}
        >
          X
        </button>
      </div>
      <p className="sudoku_puzzle_id">Puzzle #{puzzleId}</p>
    </div>
  );
}
