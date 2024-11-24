import { Action, actionIsDrop } from "./utils/Input";
import { playerController } from "./utils/PlayerController";
import { useDropTime } from "./hooks/useDropTime";

const ButtonController = ({
    board,
    gameStats,
    player,
    setGameOver,
    setPlayer,
    isPaused,
    setIsPaused
}) => {

    // DropTime Hook
    const [dropTime, pauseDropTime, resumeDropTime] = useDropTime({ gameStats });

    // Handle the button presses triggered from Tetris.jsx
    const handleButtonPress = (action) => {
        if (action === Action.Pause) {
            // Toggle the paused state and update drop time accordingly
            if (isPaused) {
                // Resume the drop time if paused
                resumeDropTime();
                // Unpause the game
                setIsPaused(false);
            } else {
                // Pause the drop time
                pauseDropTime();
                // Pause the game
                setIsPaused(true);
            }
        } else if (action === Action.Quit) {
            // Set game over state if action is quit
            setGameOver(true);
        } else {
            // Pause drop time during action
            if (actionIsDrop(action)) pauseDropTime();
            // Handle the action (move, rotate, etc)
            handleInput({ action });
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
            {/* Button Press Handlers and Controll Buttons */}
            {/* A/B BUTTONS */}
            <ul className="gameboy_buttons">
                <li onClick={() => handleButtonPress(Action.RotateRight)}>
                    <span>A</span>
                </li>
                <li onClick={() => handleButtonPress(Action.RotateLeft)}>
                    <span>B</span>
                </li>
            </ul>
            {/* START/SELECT BUTTONS */}
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
                {/* GAME PAD LEFT */}
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
                {/* GAME PAD RIGHT */}
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
                {/* GAME PAD CENTER */}
                <ul className="gameboy_circle">
                    <li></li>
                </ul>
                {/* GAME PAD UP */}
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
                {/* GAME PAD DOWN */}
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