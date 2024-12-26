import RedLink from "./RedLink";
// Import game JSON
import GamesData from "../../assets/Json/GameList.json";

export default function NavDrawer({ currentPath }) {

    // Filter JSON for isActive = true and sort alphabetically
    const GameData = GamesData
        .filter(data => data.isActive && `/games/${data.url}` !== currentPath)
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <nav id="drawer">
            <ul>
                {/* HOME LINK */}
                <li className="drawer_link">
                    <RedLink href="/" text="Home" external={false} />
                </li>
                {/* Mapping through game links from JSON file */}
                { GameData
                    .map((Game) => {
                        return (
                            <li className="drawer_link" key={Game.id}>
                                <RedLink href={`/games/${Game.url}`} text={Game.title} external={Game.external_link} />
                            </li>
                        )
                    })
                }
            </ul>
        </nav>
    );
};