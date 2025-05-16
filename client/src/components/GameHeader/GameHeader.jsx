import { Link } from "react-router-dom";
import GameInfo from "../Modals/GameInfo";

function Header({ title, onclick, turn_title, turns, howTo, isTimerPaused, setIsTimerPaused }) {
  return (
    <>
      {/* <h2>{title}</h2> */}
      <div className="button_box">
        <button onClick={onclick}>New Game</button>
        {howTo ? <GameInfo howTo={howTo} isTimerPaused={isTimerPaused} setIsTimerPaused={setIsTimerPaused} /> : ""}
        <Link to="/games"><button>Quit</button></Link>
      </div>
      {turns === 0 ? 
        <h4 id="turns">&nbsp;<span>&nbsp;</span></h4>
        : 
        <h4 id="turns">{turn_title} = <span>{turns}</span></h4>
      }
    </>
  );
}

export default Header;
