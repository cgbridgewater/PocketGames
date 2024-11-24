
import Previews from "./Previews";
import BoardCell from "./BoardCell";

const Board = ({ board, gameStats, tetrominoes }) => {

    // Deconstruct Stats Prop
    const { level, points, totalLines } = gameStats;

    // Setup the board sizing
    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };

    return (
        // container for the board , scoring , preview 
        <div className="board_container">
            {/* Game board */}
            <div className="board" style={boardStyles}>
                {board.rows.map((row,y) =>
                    row.map((cell, x) => (
                        <BoardCell key={x * board.size.columns + x} cell={cell} />
                    ))
                )}
            </div>
            {/* Scoring coloumn */}
            <div className="scoring">
                <div className="tetris_score_box">
                    <p className="tetris_score">Score</p>
                    <p>{ points}</p>
                </div>
                <div className="tetris_level">
                    <p>Level</p>
                    <p>{level}</p>
                </div>
                <div className="tetris_lines">
                    <p>Lines</p>
                    <p>{totalLines}</p>
                </div>
                {/* preview container */}
                <div className="preview_container">
                    <Previews tetrominoes={tetrominoes} />
                </div>
            </div>
        </div>
    );
};

export default Board;