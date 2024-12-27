// Import Components 
import GameCard from "../components/GameCards/GameCard";

// Import all images
import MemoryIcon from "../assets/images/MemoryIcon.jpg";
import SimonIcon from "../assets/images/SimonIcon.jpg";
import WordleIcon from "../assets/images/WordleIcon.png";
import LightsOutIcon from "../assets/images/LightsOutIcon.png";
import StackitIcon from "../assets/images/StackitIcon.png";
import TetrisIcon from "../assets/images/TetrisIcon.png";
import ColorFusionIcon from "../assets/images/ColorFusionIcon.png";
import PlaceHolder from "../assets/images/PlaceHolder.jpg";

// Import game JSON
import GamesData from "../assets/Json/GameList.json";

// Map image references in JSON to the actual image imports  // MUST MATCH JSON NAME
const imageMap = {
    MemoryIcon,
    SimonIcon,
    WordleIcon,
    LightsOutIcon,
    StackitIcon,
    TetrisIcon,
    ColorFusionIcon,
    PlaceHolder,
};

function GameMenu() {

    // Filter JSON for isActive = true and sort alphabetically
    const GameData = GamesData
        .filter(data => data.isActive)
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <main>
            <h2>Select a game</h2>
            <div className="game_icon_container">
                {/* Map through GameData */}
                {GameData.map((Game) => {
                    // Get the correct image by matching the img_ref // Default to PlaceHolder if no match
                    const image = imageMap[Game.img_ref] || PlaceHolder;
                    return (
                        <GameCard
                            key={Game.id}
                            to={`/games/${Game.url}`}
                            text={Game.title}
                            image={image}
                            status={Game.status}
                        />
                    );
                })}
            </div>
        </main>
    );
}

export default GameMenu;