import React from "react";
import { buildBoard } from "./utils/Board";
import { transferToBoard } from "./utils/Tetrominoes";
import BoardCell from "./BoardCell";

const Preview = ({ tetromino, index }) => {

    // Deconstruct Tetromino Prop
    const { shape, className } = tetromino;

    // Build Board For Preview Window
    const board = buildBoard({ rows: 4, columns: 4});
    board.rows = transferToBoard({
        className,
        isOccupied: false,
        position: { row: 0, column: 0 },
        rows: board.rows,
        shape
    });

    return (
        <div className="preview" >
            <div className="preview_board">
                {board.rows.map((row, y) =>
                    row.map((cell, x) => (
                        <BoardCell key={x * board.size.columns + x} cell={cell} />
                    ))
                )}
            </div>
        </div>
    );
};

export default React.memo(Preview);