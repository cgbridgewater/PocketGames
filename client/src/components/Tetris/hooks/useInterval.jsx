import { useEffect, useRef } from "react";

//custom hook built by Dan Abromov
export const useInterval = (callback, delay) => {
    const savedCallback = useRef();

    //Remember the latest callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // set up the interval
    useEffect (() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => {
                clearInterval(id);
            }
        }
    }, [delay]);
}