import { hasCollision, isWithinBoard } from "./Board";
import { rotate } from "./Tetrominoes";
import { Action } from "./Input";

const attemptRightRotation = ({ board, player, setPlayer }) => {
    const shape = rotate ({
        piece: player.tetromino.shape,
        direction: 1
    });

    const position = player.position; // check for collision or off board on rotation
    const isValidRotation = 
        isWithinBoard ({ board, position, shape }) &&
        !hasCollision({ board, position, shape });

    if (isValidRotation) { // if rotation is valid, update with new rotated shape
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
const attemptLeftRotation = ({ board, player, setPlayer }) => {
    const shape = rotate ({
        piece: player.tetromino.shape,
        direction: -1   
    });

    const position = player.position; // check for collision or off board on rotation
    const isValidRotation = 
        isWithinBoard ({ board, position, shape }) &&
        !hasCollision({ board, position, shape });

    if (isValidRotation) { // if rotation is valid, update with new rotated shape
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

export const movePlayer = ({ delta, position, shape, board }) => {
    const desiredNextPosition = {      // check desired location
        row: position.row + delta.row,
        column: position.column + delta.column
    };
    const collided = hasCollision({ // is it colliding?
        board,
        position: desiredNextPosition,
        shape
    });

    const isOnBoard = isWithinBoard({ // is it on the board?
        board,
        position: desiredNextPosition,
        shape
    });
    const preventMove = !isOnBoard || (isOnBoard && collided); // prevent move if off board or colliding
    const nextPosition = preventMove ? position : desiredNextPosition; // prevent move or proceed ternary

    const isMovingDown = delta.row > 0; // check for down movement number increases as you go down
    const isHit = isMovingDown && (collided || !isOnBoard);  // define collision on down move

    return { collided: isHit, nextPosition }; //return position and if collision
}


const attemptMovement = ({  // player piece movement 
    board, 
    action, 
    player, 
    setPlayer, 
    setGameOver
}) => {
    const delta = { row: 0, column: 0 }; //reference delta movement assume 0 from start
    let isFastDropping = false; // check fast drop

    if (action === Action.FastDrop) {   // set if fast dropping
        isFastDropping = true;
    } else if (action === Action.SlowDrop) { // set if slow drop
        delta.row += 1;
    } else if (action === Action.Left) {  // set if left movement
        delta.column -= 1;
    } else if (action === Action.Right) {  // set if right movement
        delta.column +=1;
    }
    const { collided, nextPosition } = movePlayer({ // try moving player with delta and check for collision
        delta,
        position: player.position,
        shape: player.tetromino.shape,
        board
    });

    //did we collide immediately?   if so, set game over!
    const isGameOver = collided && player.position.row === 0;
    if (isGameOver) {
        // add high score in here
        setGameOver(isGameOver);
    }

    setPlayer({  // update new values to move the player position
        ...player,
        collided,
        isFastDropping,
        position: nextPosition
    });

};


export const playerController = ({ // pass 'action' to the board and check for rotate or movement
    action,
    board,
    player,
    setPlayer,
    setGameOver
}) => {
    if (!action) return;

    if (action === Action.RotateRight) {                  // rotate action
        attemptRightRotation({ board, player, setPlayer });
    } else if (action === Action.RotateLeft){                                        // if no rotation action...attempt movement
        attemptLeftRotation({ board, player, setPlayer });
    } else {                                        // if no rotation action...attempt movement
        attemptMovement({ board, player, setPlayer, action, setGameOver });

    }
};
