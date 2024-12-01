import { useState } from "react";

const GameInfo = ({ howTo }) => {

    // State
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    return (
        <>
            {
                isInfoOpen ? (
                    <div  className="modal_overlay">
                        <div className="game_info">
                            <h3>How To Play</h3>
                            <p>
                                {howTo}
                            </p>
                            <div className="button_box">
                                <button onClick={() => setIsInfoOpen(false)} >
                                Close
                                </button>
                            </div>
                        </div>
                    </ div>
                ) : null
            }
            <button onClick={() => setIsInfoOpen(true)} title="Info" >
                Info
            </button>
        </>
    )
};

export default GameInfo;