import { Action, ActionForKey, actionIsDrop } from "./utils/Input";
import { playerController } from "./utils/PlayerController";
import { useDropTime } from "./hooks/useDropTime";
import { useInterval } from "./hooks/useInterval";

const GameController = ({
    board,
    gameStats, 
    player,
    setGameOver, 
    setPlayer,
    isPaused, // Receive isPaused from the parent component
    setIsPaused // To control the pause state in the parent
}) => {
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ gameStats });

    // Handle interval for slow drop, only if the game is not paused
    useInterval(() => {
        if (!isPaused && dropTime !== null) {  // Ensure the game isn't paused
            handleInput({ action: Action.SlowDrop });
        }
    }, dropTime);

    const onKeyUp = ({ code }) => {
        const action = ActionForKey(code);
        if (actionIsDrop(action)) resumeDropTime();  // Resume drop time on key release
    };
    
    const onKeyDown = ({ code }) => {
        const action = ActionForKey(code);

        if (action === Action.Pause) {    // Handle Pause action
            if (isPaused) {
                resumeDropTime();  // Resume drop time if paused
                setIsPaused(false); // Unpause the game
            } else {
                pauseDropTime();   // Pause drop time
                setIsPaused(true);  // Pause the game
            }
        } else if (action === Action.Quit) {  // Quit game action
            setGameOver(true);
        } else {
            if (actionIsDrop(action)) pauseDropTime(); // Pause drop time during drop actions
            handleInput({ action });  // Execute other actions
        }
    };

    const handleInput = ({ action }) => {
        playerController({
            action,
            board,
            player,
            setPlayer,
            setGameOver
        });
    };

    return (
        <input 
            className="GameController" 
            type="text" 
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            autoFocus
        />
    );
};

export default GameController;
