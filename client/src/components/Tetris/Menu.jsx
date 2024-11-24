import { Link } from "react-router-dom";
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaRegArrowAltCircleUp } from "react-icons/fa";

const Menu = ({ onClick }) =>{

    return(
        <div className="RulesOfGame">
            {/* Game Movement Rules */}
            <ul>
                <li className="RulesList"> <FaRegArrowAltCircleLeft/> &nbsp; MOVE LEFT</li>
                <li className="RulesList"> <FaRegArrowAltCircleRight/> &nbsp; MOVE RIGHT</li>
                <li className="RulesList"> <FaRegArrowAltCircleUp/> &nbsp; FAST DROP</li>
                <li className="RulesList"> <FaRegArrowAltCircleDown/> &nbsp; MOVE DOWN</li>
                <li className="RulesList"> <span>A</span> &nbsp; ROTATE RIGHT</li>
                <li className="RulesList"> <span>B</span> &nbsp; ROTATE LEFT</li>
                <li className="RulesList"> START = PAUSE GAME</li>
                <li className="RulesList"> SELECT = QUIT GAME</li>
            </ul>
            {/* Play and Quit Buttons */}
            <div className="rules_buttons">
                {/* Start Game Play */}
                <button className="Button" onClick={ onClick } autoFocus>
                    PLAY
                </button>
                {/* Return To /games menu page */}
                <Link to="/games">
                    <button className="Button" >
                        QUIT
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Menu;