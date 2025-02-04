import { useState } from "react";

const GameInfo = ({ howTo }) => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    
    // Split lines and render them with <br />
    const formattedHowTo = howTo.split('\n').map((line, index) => (
        <span key={index}>
            {line}
            {index < howTo.split('\n').length - 1 && <br />}
        </span>
    ));

    return (
        <>
            {
                isInfoOpen ? (
                    <div className="modal_overlay">
                        <div className="game_info">
                            <h3>How To Play</h3>
                            <p>
                                {formattedHowTo}
                            </p>
                            <div className="button_box">
                                <button onClick={() => setIsInfoOpen(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null
            }
            <button onClick={() => setIsInfoOpen(true)} title="Info">
                Info
            </button>
        </>
    )
};

export default GameInfo;