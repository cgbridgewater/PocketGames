import { useState, useEffect, useCallback } from "react";

export default function useTimer(isRunning) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const resetTimer = useCallback(() => setTime(0), []);

  return { time, resetTimer };
}