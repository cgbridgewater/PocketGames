// src/views/TreasureHunt.jsx
import React, { useState, useEffect, useRef, startTransition } from 'react';
import Board from '../components/TreasureHuntGame/Board';
import Header from '../components/GameHeader/GameHeader';
import WinningModal from '../components/Modals/WinningModal';

const BOARD_SIZE = 20;
const MAX_MOVES = 8;

export default function TreasureHunt({ 
  isWinningModalOpen, 
  setIsWinningModalOpen,
  isTimerPaused,
  setIsTimerPaused
}) {
  // Game state variables
  const [treasure, setTreasure] = useState({ x: null, y: null });
  const [moves, setMoves] = useState(0);
  const [resets, setResets] = useState(0);
  const [boardKey, setBoardKey] = useState(0); // Forces board reset when changed
  const [gameStarted, setGameStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameResult, setGameResult] = useState(""); // "win" or "lose"
  const [isReshuffling, setIsReshuffling] = useState(false);
  const timerRef = useRef(null);

  // Format elapsed time as m:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Restart function resets game state
  const restartGame = () => {
    clearInterval(timerRef.current);
    startTransition(() => {
      setTreasure({ x: null, y: null });
      setMoves(0);
      setResets(0);
      setBoardKey(prevKey => prevKey + 1);
      setGameStarted(false);
      setElapsedTime(0);
      setGameResult("");
      setIsReshuffling(false);
      setIsTimerPaused(false);
      setIsWinningModalOpen(false);
    });
  };

  // When boardKey changes, generate new treasure and reset moves.
  useEffect(() => {
    const newTreasure = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE)
    };
    setTreasure(newTreasure);
    setMoves(0);
    setIsWinningModalOpen(false);
  }, [boardKey, setIsWinningModalOpen]);

  // Timer: increment elapsedTime by 1 each second while game is active and not paused.
  useEffect(() => {
    if (gameStarted && !isReshuffling && !isTimerPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameStarted, isReshuffling, isTimerPaused]);

  // Trigger lose condition if score reaches 0.
  useEffect(() => {
    if (gameStarted && calculateScore() === 0 && !isWinningModalOpen) {
      setGameResult("lose");
      setIsWinningModalOpen(true);
      clearInterval(timerRef.current);
    }
  }, [elapsedTime, gameStarted, isWinningModalOpen]);

  // Handle tile clicks.
  const handleTileClick = (x, y) => {
    if (isReshuffling) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newMoves = moves + 1;
    setMoves(newMoves);

    if (x === treasure.x && y === treasure.y) {
      setGameResult("win");
      setIsWinningModalOpen(true);
      clearInterval(timerRef.current);
      return;
    }

    if (newMoves === MAX_MOVES) {
      setIsReshuffling(true);
      setTimeout(() => {
        setResets(prev => prev + 1);
        setBoardKey(prevKey => prevKey + 1);
        setIsReshuffling(false);
      }, 1000);
    }
  };

  // Revised score calculation: apply a time penalty and increased deduction per reset.
  const calculateScore = () => {
    // Set Base Score
    const baseScore = 10000;
    // Deduction Base 100 x resets gain
    const effectiveDeduction = 100 * (1 + resets * 0.2);
    // Calculate penalty based off time and reset deductions
    const penalty = elapsedTime * effectiveDeduction;
    // Calculate Score from base score - penalty amount
    const score = Math.max(baseScore - penalty, 0);
    return Math.floor(score);
  };

  const movesRemaining = MAX_MOVES - moves;
  let movesColor = "treasure_hunt_distance_low";
  if (movesRemaining <= (MAX_MOVES-2) && movesRemaining >= 3) movesColor = "treasure_hunt_distance_medium";
  if (movesRemaining === 1) movesColor = "treasure_hunt_distance_high";

  return (
    <main>
      <Header
        title={"Treasure Hunt"}
        onclick={restartGame}
        turn_title={"Time"}
        turns={formatTime(elapsedTime)}
        howTo={`Embark on a quest to find the hidden treasure! Click any tile to reveal its distance from the treasure. Use these clues to pinpoint the treasure’s location.
                You have a limited number of moves before the board reshuffles, and every second decreases your score. Win by finding the treasure before your score hits zero or you run out of moves. Good luck, treasure hunter!`}
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
            <>Moves Until Shuffle:{" "}
              <span className={`treasure_hunt_moves_number ${movesColor}`}>
                {movesRemaining}
              </span>
            </>
          )}
        </span>
        <span className="treasure_hunt_score">
          Score: <span className="treasure_hunt_score_number">{calculateScore()}</span>
        </span>
      </div>

      <Board
        key={boardKey}
        boardSize={BOARD_SIZE}
        treasure={treasure}
        onTileClick={handleTileClick}
      />

      {isWinningModalOpen && (
        <WinningModal
          message1={gameResult === "win" ? `YOU WIN! Score:` : `You Ran Out Of Time`}
          message2={gameResult === "win" ? "Points" : ""}
          turns={gameResult === "win" ? calculateScore() : ""}
          onClose={restartGame}
        />
      )}
    </main>
  );
}
