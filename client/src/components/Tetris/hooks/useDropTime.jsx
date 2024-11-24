import { useState, useCallback, useEffect } from "react";

const defaultDropTime = 1000;
const minimumDropTime = 100;
const speedIncrement = 120;

export const useDropTime = ({ gameStats }) => {
    // STATE
    const [previousDropTime, setPreviousDropTime] = useState(null);
    const [dropTime, setDropTime] = useState(defaultDropTime);

    // Function to resume drop time from the previous value when unpaused
    const resumeDropTime = useCallback(() => {
        // If we have a saved drop time, resume it
        if (previousDropTime !== null) {  
            setDropTime(previousDropTime);
            // Clear the saved drop time once resumed
            setPreviousDropTime(null);
        }
    }, [previousDropTime]);

    // Function to pause drop time (i.e., save the current drop time)
    const pauseDropTime = useCallback(() => {
        // Only save the drop time if it's valid
        if (dropTime !== null) {
            setPreviousDropTime(dropTime);
        }
        // Set dropTime to null to pause it
        setDropTime(null);
    }, [dropTime]);

    // Update drop time based on game level, but only if we're not paused
    useEffect(() => {
        // Don't update the speed if the game is paused
        if (dropTime !== null) {
            const speed = speedIncrement * (1.1 * (gameStats.level - 1));
            const newDropTime = Math.max(defaultDropTime - speed, minimumDropTime);
            setDropTime(newDropTime);
        }
    }, [gameStats.level, dropTime]);

    return [dropTime, pauseDropTime, resumeDropTime];
};
