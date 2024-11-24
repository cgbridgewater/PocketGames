import { Link } from "react-router-dom";
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaRegArrowAltCircleUp } from "react-icons/fa";

const Menu = ({ onClick }) =>{

    return(
        <div className="rules_of_game">
            {/* Game Movement Rules */}
            <ul>
                <li className="rules_list"> <FaRegArrowAltCircleLeft/> &nbsp; MOVE LEFT</li>
                <li className="rules_list"> <FaRegArrowAltCircleRight/> &nbsp; MOVE RIGHT</li>
                <li className="rules_list"> <FaRegArrowAltCircleUp/> &nbsp; FAST DROP</li>
                <li className="rules_list"> <FaRegArrowAltCircleDown/> &nbsp; MOVE DOWN</li>
                <li className="rules_list"> <span>A</span> &nbsp; ROTATE RIGHT</li>
                <li className="rules_list"> <span>B</span> &nbsp; ROTATE LEFT</li>
                <li className="rules_list"> START = PAUSE GAME</li>
                <li className="rules_list"> SELECT = QUIT GAME</li>
            </ul>
            {/* Play and Quit Buttons */}
            <div className="rules_buttons">
                {/* Start Game Play */}
                <button onClick={ onClick } autoFocus>
                    PLAY
                </button>
                {/* Return To /games menu page */}
                <Link to="/games">
                    <button >
                        QUIT
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default Menu;