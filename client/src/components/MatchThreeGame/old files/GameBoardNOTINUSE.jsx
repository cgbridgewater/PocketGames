// src/components/MatchThreeGame/GameBoard.jsx

import React from 'react';
import CanvasBoard from './CanvasBoard';

const GameBoard = ({
  boardSize,
  boardKey,
  onFirstSwap,
  addScore,
  isTimerPaused,
  setIsTimerPaused
}) => {
  return (
    <div className={`canvas_wrapper ${boardSize}`}>
      <CanvasBoard
        key={boardKey}
        onFirstSwap={onFirstSwap}
        addScore={addScore}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />
    </div>
  );
};

export default GameBoard;
