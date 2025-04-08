// src/views/MatchThree.jsx

import React, { useState, useEffect } from 'react';
import GameBoard from '../components/MatchThreeGame/GameBoard';
import Header from '../components/GameHeader/GameHeader';
import Timer from '../components/MatchThreeGame/Timer';
import WinningModal from "../components/Modals/WinningModal";

const MatchThree = ({ isWinningModalOpen, setIsWinningModalOpen, isTimerPaused, setIsTimerPaused }) => {
  const [boardSize, setBoardSize] = useState('small');
  const [score, setScore] = useState(0);

  // Keys to force remounting (reset) of the Timer and Board components
  const [timerKey, setTimerKey] = useState(0);
  const [boardKey, setBoardKey] = useState(0);

  // When false, the timer does not run; it will start on the first gem swap.
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setBoardSize(window.innerWidth <= 500 ? 'small' : 'large');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Called when timer reaches 0
  const handleTimeUp = () => {
    setIsTimerPaused(true);
    setIsWinningModalOpen(true);
  };

  // Restart the game manually via the Header's onclick or the modal.
  const restartGame = () => {
    setScore(0);
    setIsWinningModalOpen(false);
    setIsTimerPaused(false);
    // Force Timer and Board to reset by updating their keys.
    setTimerKey(prevKey => prevKey + 1);
    setBoardKey(prevKey => prevKey + 1);
    // Reset gameStarted; the timer won't run until the first gem swap.
    setGameStarted(false);
  };

  return (
    <main>
      <Header
        title="Match 3"
        onclick={restartGame}
        turn_title="Turns"
        turns=""
        howTo={`
          Match 3, a fast-paced match three puzzle game designed for quick, engaging sessions lasting 60 seconds.
          The core objective is to score as many points as possible by strategically swapping gems to create matches,
          triggering cascades, and taking advantage of power-ups and bonuses.
        `}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      {/* Pass gameStarted as the startTimer prop to control when Timer begins */}
      <Timer
        key={timerKey}
        initialTime={60}
        isPaused={isTimerPaused}
        onTimeUp={handleTimeUp}
        startTimer={gameStarted}
      />

      {/* Pass boardKey (to force a new board) and the onFirstSwap callback */}
      <GameBoard
        boardSize={boardSize}
        boardKey={boardKey}
        onFirstSwap={() => setGameStarted(true)}
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
