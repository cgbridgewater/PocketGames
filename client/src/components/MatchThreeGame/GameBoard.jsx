// src/components/MatchThreeGame/GameBoard.jsx

import React from 'react';
import Board from './Board';

const GameBoard = ({ boardSize, boardKey, onFirstSwap, addScore }) => {
  return (
    <div className={`game-board ${boardSize}`}>
      {/* The boardKey forces Board to remount when a new game starts.
          Pass onFirstSwap and addScore so Board can trigger timer start and update score. */}
      <Board key={boardKey} onFirstSwap={onFirstSwap} addScore={addScore} />
    </div>
  );
};

export default GameBoard;
