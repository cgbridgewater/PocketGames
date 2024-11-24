
import { useState } from "react";
import Board from "./Board";
import ButtonController from "./ButtonController";
import GameController from "./GameController";

// import Previews from "./Previews";

import { useBoard } from "./hooks/useBoard"
import { useGameStats} from "./hooks/useGameStats";
import { usePlayer } from "./hooks/usePlayer";



const Tetris = ({ rows, columns, setGameOver }) => {

    const [ isPaused, setIsPaused ] = useState(false);
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
            <div className="Tetris">
                <Board board={board} gameStats={gameStats} tetrominoes={player.tetrominoes}  />
            </div>
            <GameController
                board={board}
                gameStats={gameStats}
                player={player}
                setGameOver={setGameOver}
                setPlayer={setPlayer}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
            />
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

export default Tetris;
