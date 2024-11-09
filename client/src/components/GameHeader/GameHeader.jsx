import { Link } from "react-router-dom"

function Header ({ title, onclick, turn_title, turns }) {

    return (
        <>
            {/* Title */}
            <h2>{title}</h2>
            {/* Buttons */}
            <div className="button_box">
                <button onClick={onclick}>New Game</button>
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