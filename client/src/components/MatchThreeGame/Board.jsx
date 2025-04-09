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
import GemFlower from '../../assets/images/GemFlower.webp'; // For 4-gem linear match

const numRows = 9;
const numCols = 9;
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
  flower: GemFlower,
};

const cellSize = 50;

const createRandomGem = () => {
  const color = gemColors[Math.floor(Math.random() * gemColors.length)];
  return {
    color,
    id: Math.random().toString(36).substr(2, 9),
    special: null,
    image: gemSprites[color] || GemBlue,
    fallOffset: 0,
    swapOffset: { x: 0, y: 0 },
  };
};

// Helper: Check if two sorted arrays are equal.
const arraysEqual = (a, b) => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};

// Normalize a group of coordinates relative to a pivot; returns sorted array of strings.
const normalizeGroup = (group, pivot) => {
  return group
    .map(([r, c]) => [r - pivot[0], c - pivot[1]].toString())
    .sort();
};

// We'll keep these helpers in case we do fallback classification in processMatches.
const isTShapeGroup = (group) => {
  if (group.length !== 5) return false;

  const tTemplates = [
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], // upright with 2-cell stem
    [[0, 0], [0, 1], [0, 2], [-1, 1], [-2, 1]], // upside-down with 2-cell stem
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]], // left-facing
    [[0, 0], [1, 0], [2, 0], [1, -1], [1, -2]] // right-facing
  ].map(template => template.map(([r, c]) => [r, c].toString()).sort());

  for (let pivot of group) {
    const normalized = normalizeGroup(group, pivot);
    for (let template of tTemplates) {
      if (arraysEqual(normalized, template)) {
        return true;
      }
    }
  }
  return false;
};

const isLShapeGroup = (group) => {
  if (group.length !== 5) {
    console.log("isLShapeGroup: Group length is not 5:", group);
    return false;
  }

  const lTemplates = [
    [[0,0], [0,1], [0,2], [1,0], [2,0]],  // Down-Right L
    [[0,0], [0,-1], [0,-2], [1,0], [2,0]], // Down-Left L
    [[0,0], [0,1], [0,2], [-1,0], [-2,0]], // Up-Right L
    [[0,0], [0,-1], [0,-2], [-1,0], [-2,0]] // Up-Left L
  ].map(template => template.map(([r, c]) => [r, c].toString()).sort());

  for (let pivot of group) {
    const normalized = normalizeGroup(group, pivot);
    for (let i = 0; i < lTemplates.length; i++) {
      const template = lTemplates[i];
      if (arraysEqual(normalized, template)) {
        return true;
      }
    }
  }
  return false;
};

const findMatches = (brd) => {
  const matches = [];

  // Horizontal extended matches.
  for (let row = 0; row < numRows; row++) {
    let col = 0;
    while (col < numCols) {
      const currentGem = brd[row][col];
      if (!currentGem) {
        col++;
        continue;
      }
      const color = currentGem.color;
      let start = col;
      while (col < numCols && brd[row][col] && brd[row][col].color === color) {
        col++;
      }
      const length = col - start;
      if (length >= 3) {
        const group = [];
        for (let j = start; j < col; j++) {
          group.push([row, j]);
        }
        matches.push(group);
      }
    }
  }

  // Vertical extended matches.
  for (let col = 0; col < numCols; col++) {
    let row = 0;
    while (row < numRows) {
      const currentGem = brd[row][col];
      if (!currentGem) {
        row++;
        continue;
      }
      const color = currentGem.color;
      let start = row;
      while (row < numRows && brd[row][col] && brd[row][col].color === color) {
        row++;
      }
      const length = row - start;
      if (length >= 3) {
        const group = [];
        for (let i = start; i < row; i++) {
          group.push([i, col]);
        }
        matches.push(group);
      }
    }
  }

  // 2x2 square check.
  for (let row = 0; row < numRows - 1; row++) {
    for (let col = 0; col < numCols - 1; col++) {
      const color = brd[row][col]?.color;
      if (
        color &&
        brd[row][col + 1]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 1][col + 1]?.color === color
      ) {
        matches.push([[row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]]);
      }
    }
  }

  // T shapes (with 2-cell stem, as per your ASCII T examples).
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const color = brd[row]?.[col]?.color;
      if (!color) continue;

      // Upright T.
      if (
        row + 2 < numRows && col - 1 >= 0 && col + 1 < numCols &&
        brd[row][col - 1]?.color === color &&
        brd[row][col]?.color === color &&
        brd[row][col + 1]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col - 1],
          [row, col],
          [row, col + 1],
          [row + 1, col],
          [row + 2, col]
        ]);
      }

      // Upside-down T.
      if (
        row + 2 < numRows && col - 1 >= 0 && col + 1 < numCols &&
        brd[row][col]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col - 1]?.color === color &&
        brd[row + 2][col]?.color === color &&
        brd[row + 2][col + 1]?.color === color
      ) {
        matches.push([
          [row, col],
          [row + 1, col],
          [row + 2, col - 1],
          [row + 2, col],
          [row + 2, col + 1]
        ]);
      }

      // Left-facing T.
      if (
        row + 2 < numRows && col + 2 < numCols &&
        brd[row][col]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 1][col + 1]?.color === color &&
        brd[row + 1][col + 2]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row + 1, col],
          [row + 1, col + 1],
          [row + 1, col + 2],
          [row + 2, col]
        ]);
      }

      // Right-facing T.
      if (
        row + 2 < numRows && col - 2 >= 0 &&
        brd[row][col]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 1][col - 1]?.color === color &&
        brd[row + 1][col - 2]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row + 1, col],
          [row + 1, col - 1],
          [row + 1, col - 2],
          [row + 2, col]
        ]);
      }

      // L shapes (4 orientations).
      if (
        row + 2 < numRows && col + 2 < numCols &&
        brd[row][col + 1]?.color === color &&
        brd[row][col + 2]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([[row, col], [row, col + 1], [row, col + 2], [row + 1, col], [row + 2, col]]);
      }
      if (
        row + 2 < numRows && col - 2 >= 0 &&
        brd[row][col - 1]?.color === color &&
        brd[row][col - 2]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([[row, col], [row, col - 1], [row, col - 2], [row + 1, col], [row + 2, col]]);
      }
      if (
        row - 2 >= 0 && col + 2 < numCols &&
        brd[row][col + 1]?.color === color &&
        brd[row][col + 2]?.color === color &&
        brd[row - 1][col]?.color === color &&
        brd[row - 2][col]?.color === color
      ) {
        matches.push([[row, col], [row, col + 1], [row, col + 2], [row - 1, col], [row - 2, col]]);
      }
      if (
        row - 2 >= 0 && col - 2 >= 0 &&
        brd[row][col - 1]?.color === color &&
        brd[row][col - 2]?.color === color &&
        brd[row - 1][col]?.color === color &&
        brd[row - 2][col]?.color === color
      ) {
        matches.push([[row, col], [row, col - 1], [row, col - 2], [row - 1, col], [row - 2, col]]);
      }
    }
  }

  return matches;
};

const isLinear = (group) => {
  const rows = new Set(group.map(([r, _]) => r));
  const cols = new Set(group.map(([_, c]) => c));
  return (rows.size === 1 || cols.size === 1);
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

/*
  processMatches:
  Remove shape-based bonuses, awarding only base points = matchGroup.length * 150.
  Still spawn special gems for 2×2 squares, 4 gems, 5 gems, T shapes, L shapes.
*/

const processMatches = (currentBoard, setBoard, addScore, options = {}) => {
  const matchGroups = findMatches(currentBoard);
  if (matchGroups.length > 0) {
    let boardAfterRemoval = currentBoard.map(row => [...row]);

    matchGroups.forEach(matchGroup => {
      // Always only base points: matchGroup.length * 150.
      const baseScore = matchGroup.length * 150;
      addScore(baseScore);

      // Then spawn special gem if needed, but no shape-based bonus.

      // 2×2 square => black gem
      if (matchGroup.length === 4 && !isLinear(matchGroup)) {
        const rows = matchGroup.map(([r]) => r);
        const cols = matchGroup.map(([, c]) => c);
        const minRow = Math.min(...rows);
        const minCol = Math.min(...cols);

        let specialCoord;
        if (options.swappedIn) {
          const [sRow, sCol] = options.swappedIn;
          if (matchGroup.some(([r, c]) => r === sRow && c === sCol)) {
            specialCoord = [sRow, sCol];
          }
        }
        if (!specialCoord) specialCoord = [minRow, minCol];
        matchGroup.forEach(([r, c]) => {
          if (!(r === specialCoord[0] && c === specialCoord[1])) {
            boardAfterRemoval[r][c] = null;
          }
        });
        boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
          color: boardAfterRemoval[specialCoord[0]][specialCoord[1]]?.color || null,
          id: Math.random().toString(36).substr(2, 9),
          special: 'black',
          image: specialGemSprites.black,
          fallOffset: 0,
          swapOffset: { x: 0, y: 0 },
        };
        return;
      }

      // Linear => 3 gem => remove, 4 => flower, 5+ => disco.
      if (isLinear(matchGroup)) {
        const len = matchGroup.length;
        if (len === 3) {
          // just remove
          matchGroup.forEach(([r, c]) => {
            boardAfterRemoval[r][c] = null;
          });
        } else if (len === 4) {
          let specialCoord;
          if (options.swappedIn) {
            const [sRow, sCol] = options.swappedIn;
            if (matchGroup.some(([r, c]) => r === sRow && c === sCol)) {
              specialCoord = [sRow, sCol];
            }
          }
          if (!specialCoord) specialCoord = matchGroup[0];
          matchGroup.forEach(([r, c]) => {
            if (!(r === specialCoord[0] && c === specialCoord[1])) {
              boardAfterRemoval[r][c] = null;
            }
          });
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: boardAfterRemoval[specialCoord[0]][specialCoord[1]]?.color || null,
            id: Math.random().toString(36).substr(2, 9),
            special: 'flower',
            image: specialGemSprites.flower,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 },
          };
        } else {
          // len >= 5 => disco
          let specialCoord;
          if (options.swappedIn) {
            const [sRow, sCol] = options.swappedIn;
            if (matchGroup.some(([r, c]) => r === sRow && c === sCol)) {
              specialCoord = [sRow, sCol];
            }
          }
          if (!specialCoord) specialCoord = matchGroup[0];
          matchGroup.forEach(([r, c]) => {
            if (!(r === specialCoord[0] && c === specialCoord[1])) {
              boardAfterRemoval[r][c] = null;
            }
          });
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: boardAfterRemoval[specialCoord[0]][specialCoord[1]]?.color || null,
            id: Math.random().toString(36).substr(2, 9),
            special: 'disco',
            image: specialGemSprites.disco,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 },
          };
        }
        return;
      }

      // Non-linear group of 5 => T or L => star or glow, no shape bonus.
      if (matchGroup.length === 5 && !isLinear(matchGroup)) {
        if (isTShapeGroup(matchGroup)) {
          console.log("T shape formed");
          let specialCoord;
          if (options.swappedIn) {
            const [sRow, sCol] = options.swappedIn;
            if (matchGroup.some(([r, c]) => r === sRow && c === sCol)) {
              specialCoord = [sRow, sCol];
            }
          }
          if (!specialCoord) specialCoord = matchGroup[0];
          matchGroup.forEach(([r, c]) => {
            if (!(r === specialCoord[0] && c === specialCoord[1])) {
              boardAfterRemoval[r][c] = null;
            }
          });
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: boardAfterRemoval[specialCoord[0]][specialCoord[1]]?.color || null,
            id: Math.random().toString(36).substr(2, 9),
            special: 'star',
            image: specialGemSprites.star,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 },
          };
          return;
        } else if (isLShapeGroup(matchGroup)) {
          console.log("L shape formed");
          let specialCoord;
          if (options.swappedIn) {
            const [sRow, sCol] = options.swappedIn;
            if (matchGroup.some(([r, c]) => r === sRow && c === sCol)) {
              specialCoord = [sRow, sCol];
            }
          }
          if (!specialCoord) specialCoord = matchGroup[0];
          matchGroup.forEach(([r, c]) => {
            if (!(r === specialCoord[0] && c === specialCoord[1])) {
              boardAfterRemoval[r][c] = null;
            }
          });
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: boardAfterRemoval[specialCoord[0]][specialCoord[1]]?.color || null,
            id: Math.random().toString(36).substr(2, 9),
            special: 'glow',
            image: specialGemSprites.glow,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 },
          };
          return;
        } else {
          // Some other unknown 5-gem shape.
          matchGroup.forEach(([r, c]) => {
            boardAfterRemoval[r][c] = null;
          });
          return;
        }
      }

      // fallback => remove them.
      matchGroup.forEach(([r, c]) => {
        boardAfterRemoval[r][c] = null;
      });
    });

    const finalBoard = dropGemsFully(boardAfterRemoval);
    animateGravitySmooth(boardAfterRemoval, finalBoard, setBoard, (newBoard) => {
      processMatches(newBoard, setBoard, addScore);
    });
  }
};

const Board = ({ onFirstSwap, addScore }) => {
  const dragThreshold = 20; // pixels
  const [board, setBoard] = useState(generateBoard);
  const draggingGem = useRef(null);
  const startTouch = useRef(null);
  const [swapping, setSwapping] = useState(null);
  const firstSwapTriggered = useRef(false);

  const handleTouchStart = (row, col) => (e) => {
    draggingGem.current = { row, col };
    const touch = e.touches ? e.touches[0] : e;
    startTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!startTouch.current || !draggingGem.current) return;

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
      ((Math.abs(r1 - r2) === 1 && c1 === c2) ||
       (Math.abs(c1 - c2) === 1 && r1 === r2))
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
          processMatches(testBoard, setBoard, addScore, { swappedIn: [r2, c2] });
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
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`match3_gem${gem?.special ? ` special ${gem.special}` : ''}`}
              />
            );
          }
          return (
            <div
              key={gem.id}
              className={`match3_gem${gem.special ? ` special ${gem.special}` : ''}`}
              onMouseDown={handleTouchStart(rowIndex, colIndex)}
              onMouseMove={handleTouchMove}
              onTouchStart={handleTouchStart(rowIndex, colIndex)}
              onTouchMove={handleTouchMove}
              style={{
                transform: `translateY(${gem.fallOffset + (gem.swapOffset?.y || 0)}px) ` +
                           `translateX(${gem.swapOffset?.x || 0}px)`,
                transition: swapping ? 'transform 0.2s ease' : 'transform 0.05s linear',
              }}
            >
              <img
                src={gem.image}
                alt={gem.special ? `${gem.special}-gem` : `${gem.color}-gem`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          );
        })
      )}
    </div>
  );
};

export default Board;
