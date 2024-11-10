import { Link } from "react-router-dom";
import DeadLink from "../assets/images/DeadLink.png"

function BadURL() {

    return (
        <div className="error_404">
            <Link to="/games/" >
                <h1>
                    ERROR 404 
                    <br />
                    <span>
                        IT LOOKS LIKE YOU FOUND A
                    </span>
                    <br />
                    DEAD&nbsp; LINK
                </h1>
                <img src={DeadLink} alt="Dead Link" />
            </Link>
        </div>
    );
}

export default BadURL;