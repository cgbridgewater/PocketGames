// src/views/MatchThree.jsx

import React, { useState, useEffect } from 'react';
import GameBoard from '../components/MatchThreeGame/GameBoard';
import Header from '../components/GameHeader/GameHeader';
import Timer from '../components/MatchThreeGame/Timer';
import WinningModal from "../components/Modals/WinningModal";

const MatchThree = ({ isWinningModalOpen, setIsWinningModalOpen, isTimerPaused, setIsTimerPaused }) => {
  const [boardSize, setBoardSize] = useState('small');
  const [score, setScore] = useState(0);
  const StartTime = 60

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

  // Called when the timer reaches 0.
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

  // addScore function to add points to the score.
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
        howTo={`
          Gem Quest, a fast-paced match three puzzle game designed for quick, engaging sessions lasting ${StartTime} seconds.
          \nThe core objective is to collect as many points as possible by strategically swapping gems to create matches,
          triggering cascades, and taking advantage of power-ups and bonuses.
        `}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />
      
      {/* Timer starts only after the first gem swap */}
      <Timer
        key={timerKey}
        initialTime={StartTime}
        isPaused={isTimerPaused}
        onTimeUp={handleTimeUp}
        startTimer={gameStarted}
      />
      {/* Pass boardKey to force a new board and addScore so that Board can update the score */}
      <GameBoard
        boardSize={boardSize}
        boardKey={boardKey}
        onFirstSwap={() => setGameStarted(true)}
        addScore={addScore}
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
