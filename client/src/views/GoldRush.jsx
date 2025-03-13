// src/views/GoldRush.jsx
import React, { useState, useEffect, useRef, startTransition } from 'react';
import Board from '../components/TreasureHuntGame/Board';
import Header from '../components/GameHeader/GameHeader';
import WinningModal from '../components/Modals/WinningModal';
import BetweenRoundsModal from '../components/TreasureHuntGame/BetweenRoundsModal';

const BOARD_SIZE = 20;
const MAX_MOVES = 8;
const INITIAL_TREASURE_VALUE = 10000;
const MOVE_DEDUCTION = 500;
const TIME_DEDUCTION_PER_SEC = 100; // adjust as needed
const GAME_LENGTH = 60; // Overall game timer (60 sec)

export default function GoldRush({ 
  isWinningModalOpen, 
  setIsWinningModalOpen,
  isTimerPaused,
  setIsTimerPaused
}) {
  // Overall game and board state
  const [treasure, setTreasure] = useState({ x: null, y: null });
  const [moves, setMoves] = useState(0);
  const [resets, setResets] = useState(0);
  const [boardKey, setBoardKey] = useState(0); // Forces board reset when changed
  const [gameStarted, setGameStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(GAME_LENGTH);
  const [totalGold, setTotalGold] = useState(0);
  const [isReshuffling, setIsReshuffling] = useState(false);
  
  // New modal state for between rounds
  const [isBetweenRoundsModalOpen, setIsBetweenRoundsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "treasureFound" or "outOfMoves"
  const [currentTreasureValue, setCurrentTreasureValue] = useState(INITIAL_TREASURE_VALUE);
  // New flag to resume timer on next board interaction
  const [shouldResumeTimerOnNextInteraction, setShouldResumeTimerOnNextInteraction] = useState(false);
  
  // New state for round-specific time elapsed (resets every new round)
  const [roundElapsedTime, setRoundElapsedTime] = useState(0);

  const timerRef = useRef(null);

  // Format a time (in seconds) as m:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculate the current treasure value based on roundElapsedTime and moves for this round.
  const calculateCurrentTreasureValue = () => {
    const timePenalty = roundElapsedTime * TIME_DEDUCTION_PER_SEC;
    const movePenalty = moves * MOVE_DEDUCTION;
    const value = Math.max(INITIAL_TREASURE_VALUE - timePenalty - movePenalty, 0);
    return value;
  };

  // Restart game: reset all game states and timers.
  const restartGame = () => {
    clearInterval(timerRef.current);
    startTransition(() => {
      setTreasure({ x: null, y: null });
      setMoves(0);
      setResets(0);
      setBoardKey(prevKey => prevKey + 1);
      setGameStarted(false);
      setRemainingTime(GAME_LENGTH);
      setTotalGold(0);
      setIsReshuffling(false);
      setIsTimerPaused(false);
      setIsWinningModalOpen(false);
      setIsBetweenRoundsModalOpen(false);
      setModalType(null);
      setCurrentTreasureValue(INITIAL_TREASURE_VALUE);
      setShouldResumeTimerOnNextInteraction(false);
      setRoundElapsedTime(0);
    });
  };

  // When boardKey changes (i.e. a new round), reset the round state.
  useEffect(() => {
    const newTreasure = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    setTreasure(newTreasure);
    setMoves(0);
    setIsBetweenRoundsModalOpen(false);
    setIsWinningModalOpen(false);
    setModalType(null);
    setCurrentTreasureValue(INITIAL_TREASURE_VALUE);
    setRoundElapsedTime(0); // Reset round timer so treasure starts at full value.
  }, [boardKey]);

  // Overall game timer: decrement remainingTime each second while game is active and not paused.
  useEffect(() => {
    if (gameStarted && !isTimerPaused && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameStarted, isTimerPaused, remainingTime]);

  // Round timer: update roundElapsedTime each second for the current round.
  useEffect(() => {
    let roundTimer = null;
    if (gameStarted && !isTimerPaused && !isBetweenRoundsModalOpen) {
      roundTimer = setInterval(() => {
        setRoundElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (roundTimer) clearInterval(roundTimer);
    };
  }, [gameStarted, isTimerPaused, isBetweenRoundsModalOpen, boardKey]);

  // Trigger game over (winning modal) when the overall game time runs out.
  useEffect(() => {
    if (remainingTime === 0 && !isWinningModalOpen) {
      clearInterval(timerRef.current);
      // Trigger winning modal with total gold found.
      setIsWinningModalOpen(true);
    }
  }, [remainingTime, isWinningModalOpen]);

  // Handle tile clicks.
  const handleTileClick = (x, y) => {
    if (isReshuffling || isBetweenRoundsModalOpen) return;
    
    // If a treasure was found in the previous round, resume the timer on the first new interaction.
    if (shouldResumeTimerOnNextInteraction) {
      setIsTimerPaused(false);
      setShouldResumeTimerOnNextInteraction(false);
    }

    if (!gameStarted) {
      setGameStarted(true);
    }

    // If the treasure is clicked:
    if (x === treasure.x && y === treasure.y) {
      // Treasure found: pause timer, calculate value, show modal.
      setIsTimerPaused(true);
      const value = calculateCurrentTreasureValue();
      setCurrentTreasureValue(value);
      setModalType("treasureFound");
      setIsBetweenRoundsModalOpen(true);
      return;
    }

    // For an unsuccessful guess, update moves.
    const newMoves = moves + 1;
    setMoves(newMoves);

    // Check if moves are exhausted.
    if (newMoves === MAX_MOVES) {
      setModalType("outOfMoves");
      setIsBetweenRoundsModalOpen(true);
      return;
    }
  };

  // Handle closing of the between rounds modal.
  const handleBetweenRoundsModalClose = () => {
    if (modalType === "treasureFound") {
      // Add the found treasure value to total gold.
      setTotalGold(prev => prev + currentTreasureValue);
      // Set flag to resume timer on the next board interaction.
      setShouldResumeTimerOnNextInteraction(true);
    } else if (modalType === "outOfMoves") {
      // For out-of-moves, resume timer immediately.
      setIsTimerPaused(false);
    }
    // Reset for the next round.
    setBoardKey(prevKey => prevKey + 1);
    setIsBetweenRoundsModalOpen(false);
    setModalType(null);
    setMoves(0);
  };

  // Visual indication of moves remaining.
  const movesRemaining = MAX_MOVES - moves;
  let movesColor = "treasure_hunt_distance_low";
  if (movesRemaining <= (MAX_MOVES - 2) && movesRemaining >= 3) movesColor = "treasure_hunt_distance_medium";
  if (movesRemaining === 1) movesColor = "treasure_hunt_distance_high";

  return (
    <main>
      <Header
        title={"Gold Rush"}
        onclick={restartGame}
        turn_title={"Time"}
        turns={formatTime(remainingTime)}
        howTo={`Embark on a quest to find treasure! 
          
          Each hunt starts with the treasure worth ${INITIAL_TREASURE_VALUE.toLocaleString()} coins.
          
          Click any tile on the board to reveal your distance from the treasure.
          
          Beware — each wrong guess deducts ${MOVE_DEDUCTION.toLocaleString()} coins, and every second drains its value further.
          
          Keep a close eye on the timer the overall game lasts ${formatTime(GAME_LENGTH)}.
          
          You get ${MAX_MOVES} moves per hunt to find the treasure and secure its remaining coins. The found gold is added to your total treasure.
          
          Good luck!`}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />

      <div className="treasure_hunt_stats">
        <span className="treasure_hunt_moves">
          {isReshuffling ? (
            <span className="treasure_hunt_moves_number reshuffling" style={{ color: 'red' }}>
              Reshuffling board
            </span>
          ) : (
            <>Moves:{" "} <br />
              <span className={`treasure_hunt_moves_number ${movesColor}`}>
                {movesRemaining}
              </span>
            </>
          )}
        </span>
        <span className="treasure_hunt_score">
          Current Treasure: <br />
            <span className="treasure_hunt_score_number">
            {calculateCurrentTreasureValue().toLocaleString()}
          </span>
        </span>
        <span className="treasure_hunt_total">
          Total Treasure: <br />
          <span className="treasure_hunt_total_number">{totalGold.toLocaleString()}</span>
        </span>
      </div>

      <Board
        key={boardKey}
        boardSize={BOARD_SIZE}
        treasure={treasure}
        onTileClick={handleTileClick}
      />

      {/* Between Rounds Modal for treasure found or out-of-moves */}
      {isBetweenRoundsModalOpen && (
        <BetweenRoundsModal
          type={modalType}
          currentTreasureValue={currentTreasureValue}
          onClose={handleBetweenRoundsModalClose}
        />
      )}

      {/* Winning Modal triggered when overall time runs out */}
      {isWinningModalOpen && (
        <WinningModal
          message1={`Total Gold Collected:`}
          message2={""}
          turns={<p style={{color: "#D9B14B", fontWeight: 900, marginBottom: "8px"}}>{totalGold}</p>}
          onClose={restartGame}
        />
      )}
    </main>
  );
}
