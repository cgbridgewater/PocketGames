import { useState, useEffect } from "react";

const GameInfo = ({ howTo, isTimerPaused, setIsTimerPaused }) => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
    
  useEffect(() => {
    // When the modal opens, pause the timer; when it closes, resume.
    if (isInfoOpen) {
      setIsTimerPaused(true);
    } else {
      setIsTimerPaused(false);
    }
  }, [isInfoOpen, setIsTimerPaused]);
    
  const formattedHowTo = howTo.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < howTo.split('\n').length - 1 && <br />}
    </span>
  ));
    
  return (
    <>
      {isInfoOpen ? (
        <div className="modal_overlay">
          <div className="game_info">
            <h3>How To Play</h3>
            <p>{formattedHowTo}</p>
            <div className="button_box">
              <button onClick={() => setIsInfoOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}
      <button onClick={() => setIsInfoOpen(true)} title="Info">Info</button>
    </>
  );
};

export default GameInfo;
