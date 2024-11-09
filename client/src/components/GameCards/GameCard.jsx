import { Link } from "react-router-dom"

function GameCard ({ to, text, image, isComplete }) {

    return (
        <Link className="game_card" to={to}>
            {/* add coming soon if false */}
            {isComplete === false ?
            <div className="game_card_title">
                <h5>{text}</h5>
                <h6>(coming soon)</h6>
            </div>
            : 
            <div className="game_card_title">
                <h5>{text}</h5>
                <h6>&nbsp;</h6>
            </div>
            }
            <img src={`${image}`} alt={text}/>
        </Link>
    )
}

export default GameCard