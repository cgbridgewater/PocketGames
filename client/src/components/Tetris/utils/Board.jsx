import { defaultCell } from "./Cell";
import { movePlayer } from "./PlayerController";
import { transferToBoard } from "./Tetrominoes";

//build board based on size input (map array in array)
export const buildBoard = ({ rows, columns }) => {
    const builtRows = Array.from({ length: rows }, () =>
    Array.from({length: columns }, () => ({ ...defaultCell }))
    );

    // Return Board
    return {
        rows: builtRows,
        size: { rows, columns }
    };
};

// for fast dropping funciton
const findDropPosition = ({ board, position, shape }) => {  
    //check board size and current row
    let max = board.size.rows - position.row + 1;
    //initial row
    let row = 0;

    // for loop moves piece until collision occurs
    for (let i = 0; i < max; i++) {
        // delta is moving rows down by i increments
        const delta = {row: i, column: 0 };
        // variables to make piece movement
        const result = movePlayer({ delta, position, shape, board});
        // collision check
        const  {collided } = result;
        // if collision stop loop
        if (collided) {
            break;
        }
        // if no collision increment row count
        row = position.row + i; 
    }
    //return position and new row location
    return { ...position, row};
};


export const nextBoard = ({ board, player, resetPlayer, addLinesCleared}) => {
    
    const { tetromino, position } = player;

    // copy and clear spaces used by pieces that
    // hadn't collided and occupied spaces perminently
    let rows = board.rows.map((row) =>
        row.map((cell) => (cell.occupied ? cell : { ...defaultCell}))
    );

    // Drop position
    const dropPosition = findDropPosition({
        board,
        position,
        shape: tetromino.shape
    });

    // if fast dropping don't render it as a ghost, if you are not render the ghost
    const className = `${tetromino.className} ${player.isFastDropping ? "" : "ghost"}`;
    // transfer ghost to board
    rows = transferToBoard({
            className, 
            // if fast dropping, space is occupied
            isOccupied: player.isFastDropping,
            position: dropPosition,
            rows,
            shape: tetromino.shape
        });

        //place the piece
        //if it collided, mark the board cells as collided
        //when not fast dropping place piece
        if(!player.isFastDropping) {
            // pull piece from preview and move onto the board
            rows = transferToBoard({
                className: tetromino.className,
                isOccupied: player.collided,
                position,
                rows,
                shape: tetromino.shape
            });
        }
    // check for cleared lines
    //create new blank line
    const blankRow = rows[0].map((_) => ({ ...defaultCell})); 
    // cleared lines count
    let linesCleared = 0;
    //accumulator count and rows to be cleared
    rows = rows.reduce((acc, row) => {
        // check if every column in row is occupied
        if (row.every((column) => column.occupied)) {
            //increase clear count
            linesCleared++;
            acc.unshift([...blankRow]);
        } else {
            // push new row onto end of line
            acc.push(row);
        }
        //return accumulator 
        return acc;
    }, []);
    // Add any lines cleard to count
    if (linesCleared > 0) {
        addLinesCleared(linesCleared);
    }
    //if we collided, reset the player to top with new piece
    if (player.collided || player.isFastDropping) {
        resetPlayer();
    }
    // return the next board
    return{
        rows,
        size: { ...board.size }
    };
};

// collision detection
export const hasCollision = ({ board, position, shape }) => {
    // go through shape rows
    for (let y = 0; y < shape.length; y++) {
        const row = y + position.row;
        // go through shape columns
        for(let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const column = x + position.column;  
                // if we have a row, column or both occupied give true
                if(
                    board.rows[row] &&
                    board.rows[row][column] &&
                    board.rows[row][column].occupied
                ) {
                    // if true there is a collision
                    return true;
                }
            }
        }
    }
    // if false there is no collision
    return false;
}

//check inside board limits
export const isWithinBoard =  ({ board, position, shape }) => {
    // go through shape rows
    for (let y = 0; y < shape.length; y++) {
        const row = y + position.row;
        // go through columns
        for (let x = 0; x < shape[y].length; x++) {
            // check if there is a tetromino at that position
            if (shape[y][x]) {
                // add piece into column
                const column = x + position.column;
                //check if empty or valid
                const isValidPosition = board.rows[row] && board.rows[row][column];
                // reject if occupied
                if (!isValidPosition) return false; 
            }
        }
    }
    // all positions are valid within board
    return true;
};