import { useState, useCallback } from "react";

import { randomTetromino } from "../utils/Tetrominoes";

const buildPlayer = (previous) => {
    let tetrominoes;

    if (previous) {  // if new, build array to fill with tetrominoes
        tetrominoes = [...previous.tetrominoes];
        tetrominoes.unshift(randomTetromino());
    }else{ // fill array with random tetrominoes
        tetrominoes = Array(2)  // how many preview places are shown for preview, (-2)
        .fill(0)
        .map((_) => randomTetromino());
    };

    return {
        collided: false,
        isFastDropping: false,
        position: { row: 0, column: 4 },
        tetrominoes,
        tetromino: tetrominoes.pop() // push out newest to remove piece on board
    };
};

export const usePlayer = () => {
    const[player, setPlayer] = useState(buildPlayer());  //use and set built tetriminoes

    const resetPlayer = useCallback(() => {
        setPlayer((prev) => buildPlayer(prev));
    }, []);

    return [player, setPlayer, resetPlayer];
};

