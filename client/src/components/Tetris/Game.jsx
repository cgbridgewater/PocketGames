import Menu from "./Menu";
import Tetris from "./Tetris";

const TetrisGame = ({ rows, columns, gameOver, setGameOver }) => {
    const start = () => setGameOver(false);

return(
    <div>
        {gameOver ?
            <div className="gameboy">
                <Menu 
                    onClick={start} 
                />
                <div>
                    {/* <!-- GameBoy A/B Buttons --> */}
                    <ul className="gameboy_buttons">
                        <li>
                            <span>A</span>
                        </li>
                        <li>
                            <span>B</span>
                        </li>
                    </ul>
                    {/* <!-- GameBoy Start/Select --> */}
                    <ul className="gameboy_buttons_2">
                        <li className='gameboy_pause'>
                            <span>SELECT</span>
                        </li>
                        <li className='gameboy_start' >
                            <span>START</span>
                        </li>
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
                        <ul className='gameboy_pad_left'>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                        <ul className='gameboy_pad_right'>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                        <ul className='gameboy_circle'>
                            <li></li>
                        </ul>
                        <ul className='gameboy_pad_up'>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                        <ul className='gameboy_pad_down'>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                    </div>
                </div>
            </div>
            :
            <Tetris 
                rows={rows} 
                columns={columns} 
                setGameOver={setGameOver} 
            />
        }
    </div>
);
    

} 

export default TetrisGame;