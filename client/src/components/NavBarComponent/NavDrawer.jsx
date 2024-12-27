import React from 'react';
import RedLink from "./RedLink";
import GamesData from "../../assets/Json/GameList.json";

export default function NavDrawer({ currentPath, handleNavClick }) {
    // Filter JSON for active games and sort alphabetically
    const GameData = GamesData
        .filter(data => data.isActive && `/games/${data.url}` !== currentPath)
        .sort((a, b) => a.title.localeCompare(b.title));

    return (
        <nav id="drawer">
            <ul>
                {/* HOME LINK remove link if on games menu page */}
                { currentPath === "/games" ?
                    null
                        :
                    <li className="drawer_link" onClick={handleNavClick}>
                        <RedLink href="/games" text="Games Menu" external={false} />
                    </li>
                }
                {/* Game links */}
                {GameData.map((game) => (
                    <li className="drawer_link" key={game.id} onClick={handleNavClick}>
                        <RedLink
                            href={`/games/${game.url}`}
                            text={game.title}
                            external={game.external_link}
                        />
                    </li>
                ))}
            </ul>
        </nav>
    );
}