import { useState, useCallback } from "react";

// Build State Defaults
const buildGameStats = () => ({
    // eslint-disable-next-line
    level:1,
    // eslint-disable-next-line
    linesCompleted:0,
    // eslint-disable-next-line
    linesPerLevel:10,
    // eslint-disable-next-line
    points:0,
    // eslint-disable-next-line
    totalLines:0
});

export const useGameStats = () => {
    // STATE
    const [gameStats,setGameStats] = useState(buildGameStats());

    // Add scoring and level incrementing actions for lines cleared
    const addLinesCleared = useCallback((lines) => { 
        setGameStats((previous) => {
            const points = lines===4 ? previous.points + ((lines * 100) * lines + 1000) :previous.points + ((lines * 100) * lines); //points multiplier
            const { linesPerLevel } = previous;
            const newLinesCompleted = previous.linesCompleted + lines;
            const level = newLinesCompleted >= linesPerLevel ? previous.level + 1 : previous.level;
            const linesCompleted = newLinesCompleted % linesPerLevel;
            const totalLines =+ linesCompleted + ((level *10)-10)

            return{
                level,
                linesCompleted,
                linesPerLevel,
                points,
                totalLines
            };
        }, [])
    },[])

    return [gameStats, addLinesCleared];
}