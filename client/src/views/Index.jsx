import { Link } from "react-router-dom"
import GameIcon from "../assets/images/GameIcon.png"
import PocketGamesIcon from "../assets/images/PocketGames.png";


function Index() {

    return (
        <main>
            <div className="landing_page">
                <h3>For when you only have a minute</h3>
                <Link to="/games">
                    <button>
                            <img src={PocketGamesIcon} alt="Pocket Games" />
                            Enter
                    </button>
                </Link>
            </div>
        </main>
    );
}

export default Index