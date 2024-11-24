// Single Tetrimino cell
const BoardCell = ({ cell }) => (
    <div className={`board_cell ${cell.className}`}>
        <div className="sparkle"></div>
    </div>
);

export default BoardCell;