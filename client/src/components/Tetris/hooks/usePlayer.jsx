import { useState, useCallback } from "react";

import { randomTetromino } from "../utils/Tetrominoes";

const buildPlayer = (previous) => {

    // Declare
    let tetrominoes;
    
    // if new, build array to fill with tetrominoes
    if (previous) {  
        tetrominoes = [...previous.tetrominoes];
        tetrominoes.unshift(randomTetromino());
    // fill array with random tetrominoes
    } else {
        // how many preview places are shown for preview, (-2)
        tetrominoes = Array(2)
        .fill(0)
        .map((_) => randomTetromino());
    };

    return {
        collided: false,
        isFastDropping: false,
        position: { row: 0, column: 4 },
        tetrominoes,
        // push out newest to remove piece on board
        tetromino: tetrominoes.pop() 
    };
};

export const usePlayer = () => {
    // STATE
    const[player, setPlayer] = useState(buildPlayer()); 
    //use and set built tetriminoes
    const resetPlayer = useCallback(() => {
        setPlayer((prev) => buildPlayer(prev));
    }, []);

    return [player, setPlayer, resetPlayer];
};

