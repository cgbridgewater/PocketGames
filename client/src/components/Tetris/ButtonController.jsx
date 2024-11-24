import { Action, actionIsDrop } from "./utils/Input";
import { playerController } from "./utils/PlayerController";
import { useDropTime } from "./hooks/useDropTime";

const ButtonController = ({
    board,
    gameStats,
    player,
    setGameOver,
    setPlayer,
    isPaused,  // Receive `isPaused` from the parent component
    setIsPaused // To set the paused state in the parent
}) => {
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ gameStats });


    // Handle the button presses triggered from Tetris.jsx
    const handleButtonPress = (action) => {
        if (action === Action.Pause) {
            // Toggle the paused state and update drop time accordingly
            if (isPaused) {
                resumeDropTime();  // Resume the drop time if paused
                setIsPaused(false); // Unpause the game
            } else {
                pauseDropTime();   // Pause the drop time
                setIsPaused(true);  // Pause the game
            }
        } else if (action === Action.Quit) {
            setGameOver(true);  // Set game over state if action is quit
        } else {
            if (actionIsDrop(action)) pauseDropTime();  // Pause drop time during action
            handleInput({ action });  // Handle the action (move, rotate, etc)
        }
    };

    // Function to trigger input actions
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
        <div>
            {/* Button press handlers */}
            <ul className="gameboy_buttons">
                <li onClick={() => handleButtonPress(Action.RotateRight)}>
                    <span>A</span>
                </li>
                <li onClick={() => handleButtonPress(Action.RotateLeft)}>
                    <span>B</span>
                </li>
            </ul>
            <ul className="gameboy_buttons_2">
                <li
                    className="gameboy_pause"
                    onClick={() => handleButtonPress(Action.Quit)} // Quit game on SELECT button
                >
                    <span>SELECT</span>
                </li>
                <li
                    className="gameboy_start"
                    onClick={() => handleButtonPress(Action.Pause)} // Toggle pause on START button
                >
                    <span>START</span>
                </li>
            </ul>
            {/* GameBoy Speaker */}
            <ul className="gameboy_speaker">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
            {/* GamePad Buttons */}
            <div className="gameboy_game_pad">
                <ul
                    className="gameboy_pad_left"
                    onClick={() => handleButtonPress(Action.Left)}
                >
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <ul
                    className="gameboy_pad_right"
                    onClick={() => handleButtonPress(Action.Right)}
                >
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <ul className="gameboy_circle">
                    <li></li>
                </ul>
                <ul
                    className="gameboy_pad_up"
                    onClick={() => handleButtonPress(Action.FastDrop)}
                >
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <ul
                    className="gameboy_pad_down"
                    onClick={() => handleButtonPress(Action.SlowDrop)}
                >
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    );
};

export default ButtonController;
