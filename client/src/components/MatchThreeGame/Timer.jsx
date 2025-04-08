// src/components/MatchThreeGame/Timer.jsx

import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, isPaused, onTimeUp, startTimer }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    // Do not start the countdown until startTimer is true.
    if (!startTimer) return;

    // If the timer is paused or time is up, do nothing.
    if (isPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && onTimeUp) {
        onTimeUp(); // Trigger game over when the timer hits 0.
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [startTimer, isPaused, timeLeft, onTimeUp]);

  return <div className="game_timer">Time: <span>{timeLeft}</span></div>;
};

export default Timer;
