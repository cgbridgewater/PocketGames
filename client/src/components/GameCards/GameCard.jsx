import { Link } from "react-router-dom"

function GameCard({ to, text, image, status }) {

    // List of available statuses for game production state
    const statusMap = {
        1: "",
        2: "(In Testing)",
        3: "(coming soon)"
    };

    // Use statusMap options; default to empty string if not defined
    const statusText = statusMap[status] || "";

    return (
        <Link className="game_card" to={to}>
            {/* Title */}
            <div className="game_card_title">
                <p>{text}</p>
            </div>
            {/* Dev Banner */}
            {statusText && (
                <div className="banner">
                    <span>{statusText}</span>
                </div>
            )}
            {/* Game Icon */}
            <img src={image} alt={`${text} Icon`} />
        </Link>
    )
};

export default GameCard;
