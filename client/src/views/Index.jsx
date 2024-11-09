import { Link } from "react-router-dom"
import GameIcon from "../assets/images/GameIcon.png"

function Index() {

    return (
        <main>
            <h1>Welcom to Pocket Games</h1>
            <h3>Games for when you only have a minute</h3>
            <Link to="/games" id="enter_games">
                <h5>Enter</h5>
                <img src={GameIcon} alt="Enter Games" />
            </Link>
        </main>
    );
}

export default Index