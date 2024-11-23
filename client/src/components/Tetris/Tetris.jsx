
import Board from "./Board";
import GameController from "./GameController";
// import Previews from "./Previews";

import { useBoard } from "./hooks/useBoard"
import { useGameStats} from "./hooks/useGameStats";
import { usePlayer } from "./hooks/usePlayer";



const Tetris = ({ rows, columns, setGameOver }) => {
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
        <div className="Tetris">
            {/* <Previews tetrominoes={player.tetrominoes} /> */}
            <Board board={board} gameStats={gameStats} tetrominoes={player.tetrominoes}  />
            <GameController
            board={board}
            gameStats={gameStats}
            player={player}
            setGameOver={setGameOver}
            setPlayer={setPlayer}
            />
        </div>
    );
};

export default Tetris;
