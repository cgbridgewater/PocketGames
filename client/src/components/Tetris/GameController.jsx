import { Action, ActionForKey, actionIsDrop } from "./utils/Input";
import { playerController } from "./utils/PlayerController";

import { useDropTime } from "./hooks/useDropTime";
import { useInterval } from "./hooks/useInterval";

const GameController = ({
    board,
    gameStats, 
    player,
    setGameOver, 
    setPlayer 
}) => {
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ // drop time controller
        gameStats
    })

    useInterval(() => { // set slow drop action to 1000ms standard drop rate
        handleInput({ action: Action.SlowDrop });
    }, dropTime);


    const onKeyUp = ({ code }) => { //release of keyboard key
        const action = ActionForKey(code);
        if (actionIsDrop(action)) resumeDropTime();
    };
    
    const onKeyDown = ({ code }) => { //down stroke of keyboard key
        const action = ActionForKey(code);

        if (action === Action.Pause) {    // pause/unpause
            if (dropTime) {  // if we have a drop time, pause
                pauseDropTime();
            } else {     //  if you dont have a drop time, resume
                resumeDropTime();
            }
        } else if (action === Action.Quit) {  // quit game action
                setGameOver(true);
            }
        else {
            if (actionIsDrop(action)) pauseDropTime(); //pause drop time during action move
            handleInput ({ action });  // make action
        }
    };

    const handleInput = ({ action }) => {  // controls player
        playerController({
            action,
            board,
            player,
            setPlayer,
            setGameOver
        });
    };


    return(
        <input 
            className="GameController" 
            type="text" 
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            autoFocus
        />

    );
}


export default GameController