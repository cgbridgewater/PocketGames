
import Previews from "./Previews";
import BoardCell from "./BoardCell";


const Board = ({board,gameStats, tetrominoes }) => {
    const { level, points, totalLines } = gameStats;
    // const {rows, columns, player, resetPlayer, addLinesCleared} = board;

    const boardStyles = {
        gridTemplateRows: `repeat(${board.size.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${board.size.columns}, 1fr)`
    };

    return (
            // container for the board , scoring , preview 
            <div className="BoardContainer">
                {/* Game board */}
                <div className="Board" style={boardStyles}>
                    {board.rows.map((row,y) =>
                        row.map((cell, x) => (
                            <BoardCell key={x * board.size.columns + x} cell={cell} />
                        ))
                    )}
                </div>
                {/* Scoring coloumn */}
                <div className="Scoring">
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
                    <div className="PreviewContainer">
                        <Previews tetrominoes={tetrominoes} />
                    </div>
                </div>
            </div>
    );
};

export default Board;