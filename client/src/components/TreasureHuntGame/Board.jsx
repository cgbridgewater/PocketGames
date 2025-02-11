import React from 'react';
import Tile from './Tile';

export default function Board({ boardSize, treasure, onTileClick }) {
    const tiles = [];
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            tiles.push(
                <Tile
                key={`${x}-${y}`}
                x={x}
                y={y}
                treasure={treasure}
                onTileClick={onTileClick}
                />
            );
        }
    }
    return <div className="treasure_hunt_board">{tiles}</div>;
}