import { Link } from "react-router-dom"

function GameCard ({ to, text, image, status }) {

    // List of available statuses for game production state
    const statusMap = {
        1: <span>&nbsp;</span>,
        2: "(beta version)",
        3: "(coming soon)"
    };

    // use statusMap options, or default to option 1
    const statusText = statusMap[status] || <span>&nbsp;</span>;

    return (
        <Link className="game_card" to={to} >
            <div className="game_card_title">
                <h5>{text}</h5>
                {statusText && <h6>{statusText}</h6>}
            </div>
            {/* Game Icon */}
            <img src={`${image}`} alt={text} />
        </Link>
    )
};

export default GameCard;