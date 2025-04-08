// src/components/MatchThreeGame/GameBoard.jsx

import React from 'react';
import Board from './Board';

const GameBoard = ({ boardSize, boardKey, onFirstSwap }) => {
  return (
    <div className={`game-board ${boardSize}`}>
      {/* Passing boardKey as React key forces Board to remount when it changes */}
      <Board key={boardKey} onFirstSwap={onFirstSwap} />
    </div>
  );
};

export default GameBoard;
