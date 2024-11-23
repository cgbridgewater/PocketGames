import { useState, useCallback, useEffect } from "react"    ;

const defaultDropTime = 1000;
const minimumDropTime = 100;
const speedIncrement = 120;

export const useDropTime = ({ gameStats }) => {
    const [dropTime, setDroptime] = useState(defaultDropTime);
    const [previousDropTime, setPreviousDropTime] = useState();

    const resumeDropTime = useCallback(() => {
        if (!previousDropTime) { // if no drop time set return, otherwise resume to droptime to the previous
            return;
        }
        setDroptime(previousDropTime);
        setPreviousDropTime(null);  
    }, [previousDropTime]);

    const pauseDropTime = useCallback(() => {  // used to pause time on game pause
        if (dropTime) { // if there is a drop time, reset it to the previous
            setPreviousDropTime(dropTime);
        }
        setDroptime(null);
    }, [dropTime, setPreviousDropTime]);

    useEffect(() => { // update speed based on level (subtracting 1 to prevent speed increase on first level)
        const speed = speedIncrement * (1.1*(gameStats.level -1)); // 80ms multiplied by level
        const newDropTime = Math.max(defaultDropTime - speed, minimumDropTime); // minimum drop as catch for max speed

        setDroptime(newDropTime);
    }, [gameStats.level, setDroptime]);

    return [dropTime, pauseDropTime, resumeDropTime];
};