import GameCard from "../components/GameCards/GameCard";
import MemoryIcon from "../assets/images/MemoryIcon.jpg";
import SimonIcon from "../assets/images/SimonIcon.jpg";
import WordleIcon from "../assets/images/WordleIcon.png";
import LightsOut from "../assets/images/LightsOutIcon.png";
import Stackable from "../assets/images/StackableIcon.png";
import PlaceHolder from "../assets/images/PlaceHolder.jpg";

function GameMenu() {

    return (
        <main>
            <h2>Select a game</h2>
            <div className="game_icon_container">
                <GameCard to="/games/memory" text="Memory" image={MemoryIcon} isComplete={true} />
                <GameCard to="/games/simon" text="Simon Says" image={SimonIcon} isComplete={true} />
                <GameCard to="/games/wordle" text="Wordle" image={WordleIcon} isComplete={true} />
                <GameCard to="/games/lightsout" text="Lights Out" image={LightsOut} isComplete={true} />
                <GameCard to="/games/stackable" text="Stackable" image={Stackable} isComplete={false} />
                <GameCard to="/games/#" text="Starship" image={PlaceHolder} isComplete={false} />
                <GameCard to="/games/#" text="Tetris" image={PlaceHolder} isComplete={false} />
                {/* <GameCard to="/games/#" text="Bubble Pop" image={PlaceHolder} isComplete={false} /> */}
                {/* <GameCard to="/games/#" text="15+1" image={PlaceHolder} isComplete={false} /> */}
                {/* <GameCard to="/games/#" text="Placeholder" image={PlaceHolder} isComplete={false} /> */}
            </div>
        </main>
    );
}

export default GameMenu