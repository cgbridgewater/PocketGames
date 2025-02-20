import { Link } from "react-router-dom";

export default function NextHole({ message1, message2, turns, onClose }) {

    return (
        <div className="modal_overlay">
            <div id="winning_modal">
                <p> {turns!==1? `${message1}`: ""}</p>
                <p style={{marginTop: "8px", color: "#D9B14B"}}>{turns===1? "HOLE IN ONE!": `${turns} shots`}</p>
                <h2>{message2 === 0?  "Even": message2}</h2>
                <div className="button_box">
                    <button onClick={onClose} autoFocus>Next Hole</button>
                    <Link to="/games"><button>Quit</button></Link>
                </div>
            </div>
        </div>
    );
}