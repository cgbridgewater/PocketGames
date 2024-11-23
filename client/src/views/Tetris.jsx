import Header from "../components/GameHeader/GameHeader"
import TetrisGame from "../components/Tetris/Game";
import { useGameOver } from "../components/Tetris/hooks/useGameOver";

const Tetris = ({ isWinningModalOpen, setIsWinningModalOpen }) => {

    const [ gameOver, setGameOver, resetGameOver ] = useGameOver();
    const handleQuit = () => setGameOver(true);

    return (
        <main>
            <Header 
                title={"Tetris"} 
                onclick={handleQuit}
                turns={0}
            />
            <div className="gameboy">
                {/* Tetris Game As Screen */}
                <TetrisGame 
                    rows ={20} 
                    columns ={10} 
                    isWinningModalOpen={isWinningModalOpen} 
                    setIsWinningModalOpen={setIsWinningModalOpen}
                    gameOver={gameOver}
                    setGameOver={setGameOver}
                />
                {/* <!-- GameBoy A/B Buttons --> */}
                <ul className="gameboy_buttons">
                    <li></li>
                    <li></li>
                </ul>
                {/* <!-- GameBoy Start/Select --> */}
                <ul className="gameboy_buttons_2">
                    <li className='gameboy_start' onClick={handleQuit} ></li>
                    <li className='gameboy_pause' ></li> {/* Handle "Pause"*/}
                </ul>
                {/* <!-- GameBoy Speaker --> */}
                <ul className="gameboy_speaker">
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                {/* <!-- GameBoy Game Pad --> */}
                <div className="gameboy_game_pad">
                    <ul className='gameboy_pad_left'> {/* Handle "Left*/}
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                    <ul className='gameboy_pad_right'> {/* Handle "Right"*/}
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                    <ul className='gameboy_circle'>
                        <li></li>
                    </ul>
                    <ul className='gameboy_pad_up'> {/* Handle "FastDrop"*/}
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                    <ul className='gameboy_pad_down'> {/* Handle ""SlowDrop"*/}
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
            </div>
        </main>
    );
}

export default Tetris;