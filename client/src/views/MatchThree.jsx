// src/views/MatchThree.jsx

import React, { useState, useEffect } from 'react';
import CanvasBoard from '../components/MatchThreeGame/CanvasBoard';
import Header from '../components/GameHeader/GameHeader';
import Timer from '../components/MatchThreeGame/Timer';
import WinningModal from "../components/Modals/WinningModal";

const MatchThree = ({ isWinningModalOpen, setIsWinningModalOpen, isTimerPaused, setIsTimerPaused }) => {
  const [score, setScore] = useState(0);
  const StartTime = 120;

  const [timerKey, setTimerKey] = useState(0);
  const [boardKey, setBoardKey] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    setIsWinningModalOpen(false);
  }, []);

  const handleTimeUp = () => {
    setIsTimerPaused(true);
    setIsWinningModalOpen(true);
  };

  const restartGame = () => {
    setScore(0);
    setIsWinningModalOpen(false);
    setIsTimerPaused(false);
    setTimerKey(prevKey => prevKey + 1);
    setBoardKey(prevKey => prevKey + 1);
    setGameStarted(false);
  };

  const addScore = (points) => {
    setScore(prev => prev + points);
  };

  return (
    <main>
      <Header
        title="Gem Quest"
        onclick={restartGame}
        turn_title="Score"
        turns={score}
        howTo={`Gem Quest, a fast-paced match three puzzle game designed for quick, engaging sessions lasting ${StartTime} seconds.
        \nThe core objective is to collect as many points as possible by strategically swapping gems to create matches,
        triggering cascades, and taking advantage of power-ups and bonuses.`}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      <Timer
        key={timerKey}
        initialTime={StartTime}
        isPaused={isTimerPaused}
        onTimeUp={handleTimeUp}
        startTimer={gameStarted}
      />

      <CanvasBoard
        boardKey={boardKey}
        onFirstSwap={() => setGameStarted(true)}
        addScore={addScore}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      {isWinningModalOpen && (
        <WinningModal
          message1="You Score = "
          message2="Points!"
          turns={score}
          onClose={restartGame}
        />
      )}
    </main>
  );
};

export default MatchThree;
