import TetrisGame from "../components/Tetris/TetrisGame";
import { useGameOver } from "../components/Tetris/hooks/useGameOver";

const Tetris = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
    const [gameOver, setGameOver, resetGameOver] = useGameOver();

    return (
        <main>
            {/* Tetris Game */}
            <TetrisGame 
                rows={20}
                columns={10}
                isWinningModalOpen={isWinningModalOpen} 
                setIsWinningModalOpen={setIsWinningModalOpen}
                gameOver={gameOver}
                setGameOver={setGameOver}
            />
        </main>
    );
};

export default Tetris;