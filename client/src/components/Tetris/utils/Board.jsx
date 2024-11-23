import { defaultCell } from "./Cell";
import { movePlayer } from "./PlayerController";
import { transferToBoard } from "./Tetrominoes";


export const buildBoard = ({ rows, columns }) => { //build board based on size input (map array in array)
    const builtRows = Array.from({ length: rows }, () =>
    Array.from({length: columns }, () => ({ ...defaultCell }))
    );

    return {
        rows: builtRows,
        size: { rows, columns }
    };
};

// for fast dropping funciton
const findDropPosition = ({ board, position, shape }) => {  
    let max = board.size.rows - position.row + 1;  //check board size and current row
    let row = 0;                                   //initial row

    for (let i = 0; i < max; i++) {    // for loop moves piece until collision occurs
        const delta = {row: i, column: 0 };    // delta is moving rows down by i increments
        const result = movePlayer({ delta, position, shape, board});  // variables to make piece movement
        const  {collided } = result;   // collision check

        if (collided) {    // if collision stop loop
            break;    
        }
        row = position.row + i;     // if no collision increment row count
    }
    return { ...position, row};   //return position and new row location
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

    /////// place ghost //////   maybe remove?? or toggle??
    // if fast dropping don't render it as a ghost, if you are not render the ghost
    const className = `${tetromino.className} ${player.isFastDropping ? "" : "ghost"}`;
        rows = transferToBoard({  // transfer ghost to board
            className, 
            isOccupied: player.isFastDropping, // if fast dropping, space is occupied
            position: dropPosition,
            rows,
            shape: tetromino.shape
        });

        //place the piece
        //if it collided, mark the board cells as collided
        if(!player.isFastDropping) { //when not fast dropping place piece
            rows = transferToBoard({ // pull piece from preview and move onto the board
                className: tetromino.className,
                isOccupied: player.collided,
                position,
                rows,
                shape: tetromino.shape
            });
        }
    
    // check for cleared lines
    const blankRow = rows[0].map((_) => ({ ...defaultCell})); //create new blank line
    let linesCleared = 0;                                      // cleared lines count
    rows = rows.reduce((acc, row) => {                 //accumulator count and rows to be cleared
        if (row.every((column) => column.occupied)) { // check if every column in row is occupied
            linesCleared++;                             //increase clear count
            acc.unshift([...blankRow]);
        } else {
            acc.push(row);   // push new row onto end of line
        }
        return acc;   //return accumulator 
    }, []);

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


export const hasCollision = ({ board, position, shape }) => {  // collision detection
    for (let y = 0; y < shape.length; y++) { // go through shape rows
        const row = y + position.row;

        for(let x = 0; x < shape[y].length; x++) {  // go through shape columns
            if (shape[y][x]) {
                const column = x + position.column;  

                if(
                    board.rows[row] &&     // if we have a row, column or both occupied give true
                    board.rows[row][column] &&
                    board.rows[row][column].occupied
                ) {
                    return true;  // if true there is a collision
                }
            }
        }
    }

    return false;  // if false there is no collision
}


export const isWithinBoard =  ({ board, position, shape }) => { //check inside board limits
    for (let y = 0; y < shape.length; y++) {  // go through shape rows
        const row = y + position.row;

        for (let x = 0; x < shape[y].length; x++) {// go through columns
            if (shape[y][x]) {                     // check if there is a tetromino at that position
                const column = x + position.column;  // add piece into column
                const isValidPosition = board.rows[row] && board.rows[row][column]; //check if empty or valid

                if (!isValidPosition) return false; // reject if occupied
            }
        }
    }
    return true; // all positions are valid within board
};