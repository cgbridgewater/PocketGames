import { Link } from "react-router-dom"
import GameInfo from "../Modals/GameInfo"

function Header ({ title, onclick, turn_title, turns, howTo }) {

    return (
        <>
            {/* Title */}
            <h2>{title}</h2>
            {/* Buttons */}
            <div className="button_box">
                {/* Reset Game */}
                <button onClick={onclick}>New Game</button>
                {/* If How to play instructions are passed, display Game info modal */}
                {howTo ? <GameInfo howTo={howTo} /> : "" }
                {/* Exit to main menu */}
                <Link to="/games"><button>Quit</button></Link>
            </div>
            {/* Move Counter if zero, display nothing -> &nbsp; holds the place */}
            {turns === 0 ? 
            <h4 id="turns">&nbsp;<span>&nbsp;</span></h4>
            : 
            <h4 id="turns">{turn_title} = <span>{turns}</span></h4>
            }
        </>
    )
}

export default Header