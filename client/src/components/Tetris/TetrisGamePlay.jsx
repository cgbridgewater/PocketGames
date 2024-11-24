
import { useState } from "react";
import { useBoard } from "./hooks/useBoard"
import { useGameStats} from "./hooks/useGameStats";
import { usePlayer } from "./hooks/usePlayer";
import ButtonController from "./ButtonController";
import GameController from "./GameController";
import Board from "./Board";

const TetrisGamePlay = ({ rows, columns, setGameOver }) => {

    // STATE
    const [ isPaused, setIsPaused ] = useState(false);

    // HOOKS
    const [gameStats, addLinesCleared] = useGameStats();
    const [player, setPlayer, resetPlayer] = usePlayer();
    const [board, setBoard] = useBoard({
        rows,
        columns,
        player,
        resetPlayer,
        addLinesCleared
    });

    return (
        <div className="gameboy">
            {/* GAME BOARD */}
            <div className="tetris">
                <Board board={board} gameStats={gameStats} tetrominoes={player.tetrominoes}  />
            </div>
            {/* GAME CONTROL FOR KEY STROKES */}
            <GameController
                board={board}
                gameStats={gameStats}
                player={player}
                setGameOver={setGameOver}
                setPlayer={setPlayer}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
            />
            {/* GAME CONTROL FOR BUTTON STROKES */}
            <ButtonController
                board={board}
                gameStats={gameStats}
                player={player}
                setGameOver={setGameOver}
                setPlayer={setPlayer}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
            />
        </div>
    );
};

export default TetrisGamePlay;