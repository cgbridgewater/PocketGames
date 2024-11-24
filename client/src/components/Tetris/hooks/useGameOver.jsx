import { useState, useCallback } from "react";

export const useGameOver = () => {
    // STATE
    const [gameOver, setGameOver] = useState(true);
    // Set gameover to false to start game play
    const resetGameOver = useCallback(() => {
        setGameOver(false);
    }, []);

    return [ gameOver, setGameOver, resetGameOver ];
};
