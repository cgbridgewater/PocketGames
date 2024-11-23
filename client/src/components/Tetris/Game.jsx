import Menu from "./Menu";
import Tetris from "./Tetris";


const TetrisGame = ({ rows, columns, gameOver, setGameOver }) => {
    const start = () => setGameOver(false);
    

return(
    <div>
        {gameOver ?
            <Menu 
                onClick={start} 
            />
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