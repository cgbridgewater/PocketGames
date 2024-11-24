import { hasCollision, isWithinBoard } from "./Board";
import { rotate } from "./Tetrominoes";
import { Action } from "./Input";

// RIGHT ROTATION LOGIC
const attemptRightRotation = ({ board, player, setPlayer }) => {

    const shape = rotate ({
        piece: player.tetromino.shape,
        direction: 1
    });

    // check for collision or off board on rotation
    const position = player.position;
    const isValidRotation = 
        isWithinBoard ({ board, position, shape }) &&
        !hasCollision({ board, position, shape });

    
    if (isValidRotation) {
        setPlayer({
            ...player,
            tetromino: {
                ...player.tetromino,
                shape
            }
        });
    } else {
        return false;
    }
}

// LEFT ROTATION LOGIC
const attemptLeftRotation = ({ board, player, setPlayer }) => {

    const shape = rotate ({
        piece: player.tetromino.shape,
        direction: -1   
    });

    // check for collision or off board on rotation
    const position = player.position; 
    const isValidRotation = 
        isWithinBoard ({ board, position, shape }) &&
        !hasCollision({ board, position, shape });

    // if rotation is valid, update with new rotated shape
    if (isValidRotation) { 
        setPlayer({
            ...player,
            tetromino: {
                ...player.tetromino,
                shape
            }
        });
    } else {
        return false;
    }
}

// MOVE PIECE LOGICE
export const movePlayer = ({ delta, position, shape, board }) => {
    // check desired location
    const desiredNextPosition = {
        row: position.row + delta.row,
        column: position.column + delta.column
    };
    // is it colliding?
    const collided = hasCollision({
        board,
        position: desiredNextPosition,
        shape
    });
    // is it on the board?
    const isOnBoard = isWithinBoard({
        board,
        position: desiredNextPosition,
        shape
    });
    // prevent move if off board or colliding
    const preventMove = !isOnBoard || (isOnBoard && collided);
    // prevent move or proceed ternary
    const nextPosition = preventMove ? position : desiredNextPosition;
    // check for down movement number increases as you go down
    const isMovingDown = delta.row > 0;
    // define collision on down move
    const isHit = isMovingDown && (collided || !isOnBoard);
    //return position and if collision
    return { collided: isHit, nextPosition };
}

// player piece movement
const attemptMovement = ({
    board,
    action,
    player,
    setPlayer,
    setGameOver
}) => {

    //reference delta movement assume 0 from start
    const delta = { row: 0, column: 0 };
    // check fast drop
    let isFastDropping = false;
    // set if fast dropping
    if (action === Action.FastDrop) {
        isFastDropping = true;
    // set if slow drop
    } else if (action === Action.SlowDrop) {
        delta.row += 1;
    // set if left movement
    } else if (action === Action.Left) {
        delta.column -= 1;
    // set if right movement
    } else if (action === Action.Right) {
        delta.column +=1;
    }
    // try moving player with delta and check for collision
    const { collided, nextPosition } = movePlayer({ 
        delta,
        position: player.position,
        shape: player.tetromino.shape,
        board
    });
    //did we collide immediately?   if so, set game over!
    const isGameOver = collided && player.position.row === 0;
    if (isGameOver) {
        // add high score in here if needed
        // 
        // Set game over to bring menu screen up
        setGameOver(isGameOver);
    }
    // update new values to move the player position
    setPlayer({  
        ...player,
        collided,
        isFastDropping,
        position: nextPosition
    });
};

// pass 'action' to the board and check for rotate or movement
export const playerController = ({
    action,
    board,
    player,
    setPlayer,
    setGameOver
}) => {
    // check for any action
    if (!action) return;
    // rotate action
    if (action === Action.RotateRight) {
        attemptRightRotation({ board, player, setPlayer });
    // if no rotation action...attempt movement
    } else if (action === Action.RotateLeft){
        attemptLeftRotation({ board, player, setPlayer });
    // if no rotation action...attempt movement
    } else {
        attemptMovement({ board, player, setPlayer, action, setGameOver });
    }
};