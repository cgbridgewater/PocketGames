// src/hooks/useDropTime.jsx
import { useState, useCallback, useEffect } from "react";

const defaultDropTime = 1000;
const minimumDropTime = 100;
const speedIncrement = 120;

export const useDropTime = ({ gameStats }) => {
    const [dropTime, setDropTime] = useState(defaultDropTime);
    const [previousDropTime, setPreviousDropTime] = useState(null);

    // Function to resume drop time from the previous value when unpaused
    const resumeDropTime = useCallback(() => {
        if (previousDropTime !== null) {  // If we have a saved drop time, resume it
            setDropTime(previousDropTime);
            setPreviousDropTime(null); // Clear the saved drop time once resumed
        }
    }, [previousDropTime]);

    // Function to pause drop time (i.e., save the current drop time)
    const pauseDropTime = useCallback(() => {
        if (dropTime !== null) { // Only save the drop time if it's valid
            setPreviousDropTime(dropTime);
        }
        setDropTime(null); // Set dropTime to null to pause it
    }, [dropTime]);

    // Update drop time based on game level, but only if we're not paused
    useEffect(() => {
        if (dropTime !== null) {  // Don't update the speed if the game is paused
            const speed = speedIncrement * (1.1 * (gameStats.level - 1));
            const newDropTime = Math.max(defaultDropTime - speed, minimumDropTime);
            setDropTime(newDropTime);
        }
    }, [gameStats.level, dropTime]);

    return [dropTime, pauseDropTime, resumeDropTime];
};
