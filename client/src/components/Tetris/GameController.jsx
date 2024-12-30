import { useRef, useEffect } from "react";
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
    isPaused,
    setIsPaused
}) => {

    // Bring in drop time hook
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ gameStats });

    // Handle interval for slow drop, only if the game is not paused
    useInterval(() => {
        // Ensure the game isn't paused and dropTime is set
        if (!isPaused && dropTime !== null) {
            handleInput({ action: Action.SlowDrop });
        }
    }, dropTime);

    // Handle key releases
    const onKeyUp = ({ code }) => {
        const action = ActionForKey(code);
        // Resume drop time on key release for drop actions
        if (actionIsDrop(action)) resumeDropTime();
    };

    // Handle key presses
    const onKeyDown = ({ code }) => {
        // Determine the action for the key code
        const action = ActionForKey(code);

        // Handle pause action
        if (action === Action.Pause) {
            if (isPaused) {
                resumeDropTime(); // Resume drop time if paused
                setIsPaused(false); // Unpause the game
            } else {
                pauseDropTime();   // Pause drop time
                setIsPaused(true); // Pause the game
            }
        // Handle quit action
        } else if (action === Action.Quit) {
            setGameOver(true); // End the game
        } else {
            // Pause drop time during drop actions
            if (actionIsDrop(action)) pauseDropTime();
            // Execute other actions
            handleInput({ action });
        }
    };

    // Pass action into playerController
    const handleInput = ({ action }) => {
        playerController({
            action,
            board,
            player,
            setPlayer,
            setGameOver
        });
    };

    // Using `useRef` to keep a reference to the input element
    const inputRef = useRef(null);

    // Utility to detect mobile devices
    const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Focus the input element, ensuring that it's active and can receive keyboard input
    const focusInput = () => {
        if (!isMobile() && inputRef.current) {
            // Set focus to the input element only if not on mobile
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        // Focus the input when the component first mounts (when the game starts), only if not on mobile
        if (!isMobile()) {
            focusInput();

            // Add an event listener to the document so that if the user clicks anywhere on the page,
            // the input will gain focus. This is helpful in case focus was lost due to a different part 
            // of the page being interacted with.
            const handleOnFocus = () => {
                // Ensure the input element receives focus whenever the page is clicked
                focusInput();
            };

            // Attach the event listener for 'click' events to the document
            document.addEventListener('click', handleOnFocus);

            // Cleanup: Remove the event listener when the component is about to unmount or when the effect is re-run.
            // This ensures that we don't leave unnecessary event listeners hanging around, which could cause memory leaks
            return () => {
                document.removeEventListener('click', handleOnFocus);
            };
        }
    }, []);

    return (
        // This input is hidden from view, but it's required for keyboard stroke input
        <input 
            ref={inputRef}
            className="game_controller" 
            type="text" 
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            autoFocus={!isMobile()} // Prevent autoFocus on mobile devices
        />
    );
};

export default GameController;
