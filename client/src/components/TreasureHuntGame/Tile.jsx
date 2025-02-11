import React, { useState } from 'react';

export default function Tile({ x, y, treasure, onTileClick }) {

    const [revealed, setRevealed] = useState(false);

    const handleClick = () => {
        if (revealed) return;
        // If this tile is the treasure, do not set revealed state; just trigger win.
        if (x === treasure.x && y === treasure.y) {
            onTileClick(x, y);
            return;
        }
        setRevealed(true);
        onTileClick(x, y);
    };

    // Calculate Manhattan distance.
    const distance = Math.abs(x - treasure.x) + Math.abs(y - treasure.y);

    let distanceClass = "";
    if (distance >= 20) {
        distanceClass = "treasure_hunt_distance_high";
    } else if (distance >= 10) {
        distanceClass = "treasure_hunt_distance_medium";
    } else {
        distanceClass = "treasure_hunt_distance_low";
    }

    return (
        <div className={`treasure_hunt_tile ${revealed ? "revealed" : ""}`} onClick={handleClick}>
            {revealed && <span className={distanceClass}>{distance}</span>}
        </div>
    );
}


