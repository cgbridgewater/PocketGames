// src/components/MatchThreeGame/Board.jsx

import React, { useState, useEffect, useRef } from 'react';
import GemBlue from '../../assets/images/GemBlue.webp';
import GemGreen from '../../assets/images/GemGreen.webp';
import GemYellow from '../../assets/images/GemYellow.webp';
import GemRed from '../../assets/images/GemRed.webp';
import GemOrange from '../../assets/images/GemOrange.webp';
import GemPurple from '../../assets/images/GemPurple.webp';
import GemWhite from '../../assets/images/GemWhite.webp';
import GemStar from '../../assets/images/GemStar.webp';
import GemGlow from '../../assets/images/GemGlow.webp';
import GemDisco from '../../assets/images/GemDisco.webp';
import GemBlack from '../../assets/images/GemBlack.webp';

const numRows = 8;
const numCols = 8;
const gemColors = ['blue', 'green', 'yellow', 'red', 'orange', 'purple', 'white'];

const gemSprites = {
  blue: GemBlue,
  green: GemGreen,
  yellow: GemYellow,
  red: GemRed,
  orange: GemOrange,
  purple: GemPurple,
  white: GemWhite,
};

const specialGemSprites = {
  star: GemStar,
  glow: GemGlow,
  disco: GemDisco,
  black: GemBlack,
};

const cellSize = 50;

const createRandomGem = () => {
  const color = gemColors[Math.floor(Math.random() * gemColors.length)];
  const special = null;
  const image = gemSprites[color] || GemBlue;
  return {
    color,
    id: Math.random().toString(36).substr(2, 9),
    special,
    image,
    fallOffset: 0,
    swapOffset: { x: 0, y: 0 },
  };
};

const findMatches = (brd) => {
  const matches = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols - 2; col++) {
      const gem1 = brd[row][col];
      const gem2 = brd[row][col + 1];
      const gem3 = brd[row][col + 2];
      if (gem1 && gem2 && gem3 && gem1.color === gem2.color && gem1.color === gem3.color) {
        matches.push([[row, col], [row, col + 1], [row, col + 2]]);
      }
    }
  }
  for (let col = 0; col < numCols; col++) {
    for (let row = 0; row < numRows - 2; row++) {
      const gem1 = brd[row][col];
      const gem2 = brd[row + 1][col];
      const gem3 = brd[row + 2][col];
      if (gem1 && gem2 && gem3 && gem1.color === gem2.color && gem1.color === gem3.color) {
        matches.push([[row, col], [row + 1, col], [row + 2, col]]);
      }
    }
  }
  for (let row = 0; row < numRows - 1; row++) {
    for (let col = 0; col < numCols - 1; col++) {
      const gem1 = brd[row][col];
      const gem2 = brd[row][col + 1];
      const gem3 = brd[row + 1][col];
      const gem4 = brd[row + 1][col + 1];
      if (
        gem1 && gem2 && gem3 && gem4 &&
        gem1.color === gem2.color &&
        gem1.color === gem3.color &&
        gem1.color === gem4.color
      ) {
        matches.push([[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]);
      }
    }
  }
  return matches.flat();
};

const hasInitialMatches = (brd) => {
  return findMatches(brd).length > 0;
};

const generateBoard = () => {
  let newBoard;
  do {
    newBoard = [];
    for (let row = 0; row < numRows; row++) {
      const newRow = [];
      for (let col = 0; col < numCols; col++) {
        newRow.push(createRandomGem());
      }
      newBoard.push(newRow);
    }
  } while (hasInitialMatches(newBoard));
  return newBoard;
};

const dropGemsFully = (brd) => {
  const newBoard = brd.map(row => [...row]);
  for (let col = 0; col < numCols; col++) {
    const column = [];
    for (let row = 0; row < numRows; row++) {
      if (newBoard[row][col]) column.push(newBoard[row][col]);
    }
    const numEmpty = numRows - column.length;
    for (let i = 0; i < numEmpty; i++) {
      column.unshift(createRandomGem());
    }
    for (let row = 0; row < numRows; row++) {
      newBoard[row][col] = column[row];
    }
  }
  return newBoard;
};

const animateGravitySmooth = (oldBoard, finalBoard, setBoard, callback) => {
  const duration = 80;
  const startTime = performance.now();
  const newBoardAnimation = () => {
    const currentTime = performance.now();
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const animatedBoard = finalBoard.map((row, targetRow) =>
      row.map((gem, col) => {
        if (!gem) return null;
        let startRow = -1;
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            const oldGem = oldBoard[i][j];
            if (oldGem && oldGem.id === gem.id) {
              startRow = i;
              break;
            }
          }
          if (startRow !== -1) break;
        }
        const delta = (targetRow - startRow) * cellSize;
        return { ...gem, fallOffset: -delta * (1 - progress) };
      })
    );
    setBoard(animatedBoard);
    if (progress < 1) {
      requestAnimationFrame(newBoardAnimation);
    } else if (callback) {
      callback(animatedBoard);
    }
  };
  requestAnimationFrame(newBoardAnimation);
};

const processMatches = (currentBoard, setBoard) => {
  const matches = findMatches(currentBoard);
  if (matches.length > 0) {
    const boardAfterRemoval = currentBoard.map(row => [...row]);
    matches.forEach(([row, col]) => {
      boardAfterRemoval[row][col] = null;
    });
    const finalBoard = dropGemsFully(boardAfterRemoval);
    animateGravitySmooth(boardAfterRemoval, finalBoard, setBoard, (newBoard) => {
      processMatches(newBoard, setBoard);
    });
  }
};

const Board = ({ onFirstSwap }) => {
  const dragThreshold = 20; // pixels
  const [board, setBoard] = useState(generateBoard);
  const draggingGem = useRef(null);
  const startTouch = useRef(null);
  const [swapping, setSwapping] = useState(null);
  
  // This ref ensures we trigger the first swap callback only once.
  const firstSwapTriggered = useRef(false);

  const handleTouchStart = (row, col) => (e) => {
    draggingGem.current = { row, col };
    const touch = e.touches ? e.touches[0] : e;
    startTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!startTouch.current || !draggingGem.current) return;
    
    // Trigger the onFirstSwap callback once when the user makes the first gem swap.
    if (!firstSwapTriggered.current && onFirstSwap) {
      onFirstSwap();
      firstSwapTriggered.current = true;
    }

    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startTouch.current.x;
    const dy = touch.clientY - startTouch.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const { row: r1, col: c1 } = draggingGem.current;
    let r2 = r1, c2 = c1;
    
    if (absDx > absDy && absDx > dragThreshold) {
      c2 = dx > 0 ? c1 + 1 : c1 - 1;
    } else if (absDy > dragThreshold) {
      r2 = dy > 0 ? r1 + 1 : r1 - 1;
    } else {
      return;
    }

    if (
      r2 >= 0 && r2 < numRows &&
      c2 >= 0 && c2 < numCols &&
      ((Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2))
    ) {
      const testBoard = board.map(row => row.map(g => ({ ...g, swapOffset: { x: 0, y: 0 } })));
      [testBoard[r1][c1], testBoard[r2][c2]] = [testBoard[r2][c2], testBoard[r1][c1]];

      const deltaX = (c2 - c1) * cellSize;
      const deltaY = (r2 - r1) * cellSize;

      const newBoard = board.map(row => row.map(gem => ({ ...gem })));
      newBoard[r1][c1].swapOffset = { x: deltaX, y: deltaY };
      newBoard[r2][c2].swapOffset = { x: -deltaX, y: -deltaY };
      setBoard(newBoard);
      setSwapping({ r1, c1, r2, c2 });

      setTimeout(() => {
        if (findMatches(testBoard).length > 0) {
          setBoard(testBoard);
          setSwapping(null);
          processMatches(testBoard, setBoard);
        } else {
          const reversedBoard = board.map(row => row.map(g => ({ ...g, swapOffset: { x: 0, y: 0 } })));
          setBoard(reversedBoard);
          setTimeout(() => setSwapping(null), 200);
        }
      }, 200);

      draggingGem.current = null;
      startTouch.current = null;
    }
  };

  return (
    <div className="match3_board" style={{ overflow: 'hidden' }}>
      {board.map((row, rowIndex) =>
        row.map((gem, colIndex) => {
          if (!gem) {
            return <div key={`${rowIndex}-${colIndex}`} className="match3_gem" />;
          }
          return (
            <div
              key={gem.id}
              className="match3_gem"
              onMouseDown={handleTouchStart(rowIndex, colIndex)}
              onMouseMove={handleTouchMove}
              onTouchStart={handleTouchStart(rowIndex, colIndex)}
              onTouchMove={handleTouchMove}
              style={{
                transform: `translateY(${gem.fallOffset}px) translateX(${gem.swapOffset?.x || 0}px)`,
                transition: swapping ? 'transform 0.2s ease' : 'transform 0.05s linear',
              }}
            >
              <img
                src={gem.image}
                alt={`${gem.color}-gem`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default Board;
