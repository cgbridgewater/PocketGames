import { Link } from "react-router-dom";

export default function WinningModal({ message1, message2, turns, onClose }) {

    // Closes Modal when overlay is clicked  <-- Maybe delete this to force a button push??
    const handleOverlayClick = (e) => {
        if (e.target.id === 'winning_overlay') {
            onClose();
        }
    };

    return (
        <div id="winning_overlay" onClick={handleOverlayClick} >
            <div id="winning_modal">
                <h2>Game Over!</h2>
                <p>{message1} {turns} {message2}</p>
                <div className="button_box">
                    <button onClick={onClose}>Play Again?</button>
                    <Link to="/games"><button>Quit</button></Link>
                </div>
            </div>
        </div>
    );
}