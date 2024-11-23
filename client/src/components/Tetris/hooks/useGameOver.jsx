import { useState, useCallback } from "react";

export const useGameOver = () => {
    const [gameOver, setGameOver] = useState(true);

    const resetGameOver = useCallback(() => {
        console.log("START", gameOver)
        setGameOver(false);
    }, []);

    return [ gameOver, setGameOver, resetGameOver ];
};
