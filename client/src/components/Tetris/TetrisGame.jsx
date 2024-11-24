import Menu from "./Menu";
import TetrisGamePlay from "./TetrisGamePlay";

const TetrisGame = ({ rows, columns, gameOver, setGameOver }) => {

    // Button Control For Ternary Between Menu and Game Play
    const start = () => setGameOver(false);

    return(
        <div>
            <h2>TETRIS</h2>
            {gameOver ?
                <div className="gameboy">
                    {/* Menu Screen */}
                    <Menu 
                        onClick={start} 
                    />
                    <div>
                        {/* GameBoy A/B Buttons*/}
                        <ul className="gameboy_buttons">
                            <li>
                                <span>A</span>
                            </li>
                            <li>
                                <span>B</span>
                            </li>
                        </ul>
                        {/* GameBoy Start/Select*/}
                        <ul className="gameboy_buttons_2">
                            <li className='gameboy_pause'>
                                <span>SELECT</span>
                            </li>
                            <li className='gameboy_start' >
                                <span>START</span>
                            </li>
                        </ul>
                        {/* GameBoy Speaker*/}
                        <ul className="gameboy_speaker">
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul>
                        {/* GameBoy Game Pad*/}
                        <div className="gameboy_game_pad">
                            {/* GameBoy Game Left*/}
                            <ul className='gameboy_pad_left'>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                            {/* GameBoy Game Right*/}
                            <ul className='gameboy_pad_right'>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                            {/* GameBoy Game Circle*/}
                            <ul className='gameboy_circle'>
                                <li></li>
                            </ul>
                            {/* GameBoy Game Up*/}
                            <ul className='gameboy_pad_up'>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                                <li></li>
                            </ul>
                            {/* GameBoy Game Down*/}
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
                // Tetris Game Play
                <TetrisGamePlay
                    rows={rows} 
                    columns={columns} 
                    setGameOver={setGameOver} 
                />
            }
        </div>
    );

} 

export default TetrisGame;