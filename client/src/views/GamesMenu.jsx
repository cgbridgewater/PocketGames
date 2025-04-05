// Import Components 
import GameCard from "../components/GameCards/GameCard";

// Import all images
import MemoryIcon from "../assets/images/MemoryIcon2.png";
import BreakOutIcon from "../assets/images/BreakOutIcon.png";
import SimonIcon from "../assets/images/SimonIcon2.jpg";
import WordleIcon from "../assets/images/WordleIcon2.png";
import BubbleManiaIcon from "../assets/images/BubbleManiaIcon.png";
import BubbleBlitzIcon from "../assets/images/BubbleBlitzIcon.png";
import LightsOutIcon from "../assets/images/LightsOutIcon2.png";
import StackitIcon from "../assets/images/StackitIcon2.png";
import TetrisIcon from "../assets/images/TetrisIcon.webp";
import ColorFusionIcon from "../assets/images/ColorFusionIcon2.png";
import SudokuIcon from "../assets/images/SudokuIcon2.png";
import Stacker3dIcon from "../assets/images/Stacker3dIcon.png";
import Futoshiki from "../assets/images/FutoshikiIcon3.png";
// import Futoshiki from "../assets/images/FutoshikiIcon2.png";
import MiniGolfIcon from "../assets/images/MiniGolfIcon2.jpg";
import GoldRush from "../assets/images/GoldRushIcon.webp";
import PlaceHolder from "../assets/images/PlaceHolder.jpg";

// Import game JSON
import GamesData from "../assets/Json/GameList.json";

// Map image references in JSON to the actual image imports  // MUST MATCH JSON NAME
const imageMap = {
    BreakOutIcon,
    BubbleManiaIcon,
    BubbleBlitzIcon,
    MemoryIcon,
    SimonIcon,
    WordleIcon,
    LightsOutIcon,
    StackitIcon,
    TetrisIcon,
    ColorFusionIcon,
    SudokuIcon,
    Stacker3dIcon,
    Futoshiki,
    GoldRush,
    MiniGolfIcon,
    PlaceHolder,
};

function GameMenu() {

    // Filter JSON for isActive = true and sort alphabetically
    const GameData = GamesData
        .filter(data => data.isActive)
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <div className="game_menu">
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
        </div>
    );
}

export default GameMenu;