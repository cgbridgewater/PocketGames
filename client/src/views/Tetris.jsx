import Header from "../components/GameHeader/GameHeader"
import TetrisGame from "../components/Tetris/Game";
import { useGameOver } from "../components/Tetris/hooks/useGameOver";

const Tetris = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
    const [gameOver, setGameOver, resetGameOver] = useGameOver();

    return (
        <main>
            <Header title={"Tetris"} onclick={() => setGameOver(true)} turns={0} />
            <div>
                {/* Tetris Game As Screen */}
                <TetrisGame 
                    rows={20} 
                    columns={10} 
                    isWinningModalOpen={isWinningModalOpen} 
                    setIsWinningModalOpen={setIsWinningModalOpen}
                    gameOver={gameOver}
                    setGameOver={setGameOver}
                />
            </div>
        </main>
    );
};

export default Tetris;