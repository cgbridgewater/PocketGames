import { Link } from "react-router-dom";

export default function WinningModal({ message1, message2, turns, onClose }) {

    return (
        <div className="modal_overlay">
            <div id="winning_modal">
                <h2>Game Over!</h2>
                <p>{message1} <span>{turns}</span> {message2}</p>
                <div className="button_box">
                    <button onClick={onClose} autoFocus>Play Again?</button>
                    <Link to="/games"><button>Quit</button></Link>
                </div>
            </div>
        </div>
    );
}