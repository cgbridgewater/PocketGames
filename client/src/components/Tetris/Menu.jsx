import { FaRegArrowAltCircleDown, FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaRegArrowAltCircleUp } from "react-icons/fa";
import { Link } from "react-router-dom";

const Menu = ({ onClick }) =>{
    
    return(
            <div className="RulesOfGame">
                <ul>
                    <li className="RulesList"> <FaRegArrowAltCircleLeft/> &nbsp; Move Left</li>
                    <li className="RulesList"> <FaRegArrowAltCircleRight/> &nbsp; Move Right</li>
                    <li className="RulesList"> <FaRegArrowAltCircleUp/> &nbsp; Hard Drop</li>
                    <li className="RulesList"> <FaRegArrowAltCircleDown/> &nbsp; Move Down</li>
                    <li className="RulesList"> <span>A</span> &nbsp; Rotate Right</li>
                    <li className="RulesList"> <span>B</span> &nbsp; Rotate Left</li>
                    <li className="RulesList"> Start = Pause Game</li>
                    <li className="RulesList"> Select = Quit Game</li>
                </ul>
                <div className="rules_buttons">
                    <button className="Button" onClick={ onClick } autoFocus>
                        Play
                    </button>
                    <Link to="/games">
                        <button className="Button" onClick={ onClick } >
                            Menu
                        </button>
                    </Link>
                </div>
            </div>
    );
}

export default Menu;