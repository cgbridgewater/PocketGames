// Import Components 
import GameCard from "../components/GameCards/GameCard";

// Import all images
// import MemoryIcon from "../assets/images/MemoryIcon.jpg";
import MemoryIcon2 from "../assets/images/MemoryIcon2.png";
// import SimonIcon from "../assets/images/SimonIcon.jpg";
import SimonIcon2 from "../assets/images/SimonIcon2.jpg";
import WordleIcon2 from "../assets/images/WordleIcon2.png";
// import WordleIcon from "../assets/images/WordleIcon.png";
// import BubbleBlastIcon from "../assets/images/BubbleBlastIcon.png";
import BubbleManiaIcon from "../assets/images/BubbleManiaIcon.png";
// import LightsOutIcon from "../assets/images/LightsOutIcon.png";
import LightsOutIcon2 from "../assets/images/LightsOutIcon2.png";
// import StackitIcon from "../assets/images/StackitIcon.png";
import StackitIcon2 from "../assets/images/StackitIcon2.png";
// import TetrisIcon from "../assets/images/TetrisIcon.png";
import TetrisIcon2 from "../assets/images/TetrisIcon.webp";
import ColorFusionIcon from "../assets/images/ColorFusionIcon2.png";
// import SudokuIcon from "../assets/images/SudokuIcon.png";
import SudokuIcon2 from "../assets/images/SudokuIcon2.png";
import Futoshiki from "../assets/images/FutoshikiIcon2.png";
// import MiniGolfIcon from "../assets/images/MiniGolfIcon.png";
import MiniGolfIcon2 from "../assets/images/MiniGolfIcon2.jpg";
import GoldRush from "../assets/images/GoldRushIcon.webp";
import PlaceHolder from "../assets/images/PlaceHolder.jpg";

// Import game JSON
import GamesData from "../assets/Json/GameList.json";

// Map image references in JSON to the actual image imports  // MUST MATCH JSON NAME
const imageMap = {
    // BubbleBlastIcon,
    BubbleManiaIcon,
    // MemoryIcon,
    MemoryIcon2,
    // SimonIcon,
    SimonIcon2,
    // WordleIcon,
    WordleIcon2,
    LightsOutIcon2,
    // LightsOutIcon,
    StackitIcon2,
    // StackitIcon,
    // TetrisIcon,
    TetrisIcon2,
    ColorFusionIcon,
    SudokuIcon2,
    // SudokuIcon,
    Futoshiki,
    GoldRush,
    // MiniGolfIcon,
    MiniGolfIcon2,
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