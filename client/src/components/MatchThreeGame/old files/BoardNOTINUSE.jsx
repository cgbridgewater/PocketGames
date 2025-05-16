// src/components/MatchThreeGame/Board.jsx

import React, { useState, useEffect, useRef } from "react";
import Explosion from "./Explosion";
import ShuffleModal from "./ShuffleModal";
import GemBlue from "../../assets/images/GemBlue.webp";
import GemGreen from "../../assets/images/GemGreen.webp";
import GemYellow from "../../assets/images/GemYellow.webp";
import GemRed from "../../assets/images/GemRed.webp";
import GemOrange from "../../assets/images/GemOrange.webp";
import GemPurple from "../../assets/images/GemPurple.webp";
import GemWhite from "../../assets/images/GemWhite.webp";
import GemStar from "../../assets/images/GemStar.webp";
import GemGlow from "../../assets/images/GemGlow.webp";
import GemDisco from "../../assets/images/GemDisco.webp";
import GemBlack from "../../assets/images/GemBlack.webp";
import GemFlower from "../../assets/images/GemFlower.webp";

const numRows = 9;
const numCols = 9;
const gemColors = ["blue", "green", "yellow", "red", "orange", "purple", "white"];

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

// --- Matching Helpers ---
const arraysEqual = (a, b) =>
  a.length === b.length && a.every((val, index) => val === b[index]);

const normalizeGroup = (group, pivot) =>
  group.map(([r, c]) => [r - pivot[0], c - pivot[1]].toString()).sort();

const isTShapeGroup = (group) => {
  if (group.length !== 5) return false;
  const tTemplates = [
    [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [0, 2], [-1, 1], [-2, 1]],
    [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 0], [1, 0], [2, 0], [1, -1], [1, -2]],
  ].map((template) =>
    template.map(([r, c]) => [r, c].toString()).sort()
  );
  for (let pivot of group) {
    const normalized = normalizeGroup(group, pivot);
    for (let template of tTemplates) {
      if (arraysEqual(normalized, template)) return true;
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
    [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
    [[0, 0], [0, -1], [0, -2], [1, 0], [2, 0]],
    [[0, 0], [0, 1], [0, 2], [-1, 0], [-2, 0]],
    [[0, 0], [0, -1], [0, -2], [-1, 0], [-2, 0]],
  ].map((template) =>
    template.map(([r, c]) => [r, c].toString()).sort()
  );
  for (let pivot of group) {
    const normalized = normalizeGroup(group, pivot);
    for (let template of lTemplates) {
      if (arraysEqual(normalized, template)) return true;
    }
  }
  return false;
};

const findMatches = (brd) => {
  const matches = [];
  // Horizontal matches.
  for (let row = 0; row < numRows; row++) {
    let col = 0;
    while (col < numCols) {
      const currentGem = brd[row][col];
      if (!currentGem) { col++; continue; }
      const color = currentGem.color;
      const start = col;
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
  // Vertical matches.
  for (let col = 0; col < numCols; col++) {
    let row = 0;
    while (row < numRows) {
      const currentGem = brd[row][col];
      if (!currentGem) { row++; continue; }
      const color = currentGem.color;
      const start = row;
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
  // 2x2 matches.
  for (let row = 0; row < numRows - 1; row++) {
    for (let col = 0; col < numCols - 1; col++) {
      const color = brd[row][col]?.color;
      if (
        color &&
        brd[row][col + 1]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 1][col + 1]?.color === color
      ) {
        matches.push([
          [row, col],
          [row, col + 1],
          [row + 1, col],
          [row + 1, col + 1],
        ]);
      }
    }
  }
  // T and L shapes.
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const color = brd[row]?.[col]?.color;
      if (!color) continue;
      // Upright T.
      if (
        row + 2 < numRows &&
        col - 1 >= 0 &&
        col + 1 < numCols &&
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
          [row + 2, col],
        ]);
      }
      // Upside-down T.
      if (
        row + 2 < numRows &&
        col - 1 >= 0 &&
        col + 1 < numCols &&
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
          [row + 2, col + 1],
        ]);
      }
      // Left-facing T.
      if (
        row + 2 < numRows &&
        col + 2 < numCols &&
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
          [row + 2, col],
        ]);
      }
      // Right-facing T.
      if (
        row + 2 < numRows &&
        col - 2 >= 0 &&
        brd[row][col]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 1][col - 1]?.color === color &&
        brd[row + 1][col - 2]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row + 1, col],
          [row + 1][col - 1],
          [row + 1, col - 2],
          [row + 2, col],
        ]);
      }
      // L shapes.
      if (
        row + 2 < numRows &&
        col + 2 < numCols &&
        brd[row][col + 1]?.color === color &&
        brd[row][col + 2]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row, col + 1],
          [row, col + 2],
          [row + 1, col],
          [row + 2, col],
        ]);
      }
      if (
        row + 2 < numRows &&
        col - 2 >= 0 &&
        brd[row][col - 1]?.color === color &&
        brd[row][col - 2]?.color === color &&
        brd[row + 1][col]?.color === color &&
        brd[row + 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row, col - 1],
          [row, col - 2],
          [row + 1, col],
          [row + 2, col],
        ]);
      }
      if (
        row - 2 >= 0 &&
        col + 2 < numCols &&
        brd[row][col + 1]?.color === color &&
        brd[row][col + 2]?.color === color &&
        brd[row - 1][col]?.color === color &&
        brd[row - 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row, col + 1],
          [row, col + 2],
          [row - 1, col],
          [row - 2, col],
        ]);
      }
      if (
        row - 2 >= 0 &&
        col - 2 >= 0 &&
        brd[row][col - 1]?.color === color &&
        brd[row][col - 2]?.color === color &&
        brd[row - 1][col]?.color === color &&
        brd[row - 2][col]?.color === color
      ) {
        matches.push([
          [row, col],
          [row, col - 1],
          [row, col - 2],
          [row - 1, col],
          [row - 2, col],
        ]);
      }
    }
  }
  return matches;
};

const isLinear = (group) => {
  const rows = new Set(group.map(([r]) => r));
  const cols = new Set(group.map(([, c]) => c));
  return rows.size === 1 || cols.size === 1;
};

const hasInitialMatches = (brd) => findMatches(brd).length > 0;

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
  const newBoard = brd.map((row) => [...row]);
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

const shuffleBoard = (brd) => {
  const flatGems = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      flatGems.push(brd[row][col]);
    }
  }
  for (let i = flatGems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatGems[i], flatGems[j]] = [flatGems[j], flatGems[i]];
  }
  const newBoard = [];
  let index = 0;
  for (let row = 0; row < numRows; row++) {
    const newRow = [];
    for (let col = 0; col < numCols; col++) {
      newRow.push(flatGems[index]);
      index++;
    }
    newBoard.push(newRow);
  }
  return newBoard;
};

const animateShuffle = (oldBoard, newBoard, setBoard, duration = 2000, callback) => {
  const startTime = performance.now();
  const animationStep = () => {
    const currentTime = performance.now();
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const animatedBoard = newBoard.map((row, newRow) =>
      row.map((gem, newCol) => {
        let oldRow = newRow, oldCol = newCol;
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            if (oldBoard[r][c].id === gem.id) {
              oldRow = r;
              oldCol = c;
              break;
            }
          }
        }
        const offsetX = (oldCol - newCol) * cellSize * (1 - progress);
        const offsetY = (oldRow - newRow) * cellSize * (1 - progress);
        return { ...gem, swapOffset: { x: offsetX, y: offsetY } };
      })
    );
    setBoard(animatedBoard);
    if (progress < 1) {
      requestAnimationFrame(animationStep);
    } else if (callback) {
      callback(newBoard);
    }
  };
  requestAnimationFrame(animationStep);
};

// --- Updated Remove Functions ---
function removeAll(board, matchGroup, spawnExplosion) {
  matchGroup.forEach(([r, c]) => {
    const gem = board[r][c];
    if (gem && spawnExplosion) {
      spawnExplosion(r, c, "+150", gem.color);
    }
    board[r][c] = null;
  });
}

function removeAllBut(board, group, keepCoord, spawnExplosion) {
  group.forEach(([r, c]) => {
    if (r !== keepCoord[0] || c !== keepCoord[1]) {
      const gem = board[r][c];
      if (gem && spawnExplosion) {
        spawnExplosion(r, c, "+150", gem.color);
      }
      board[r][c] = null;
    }
  });
}

function pickSpecialCoord(matchGroup, swappedIn) {
  if (swappedIn) {
    const [sRow, sCol] = swappedIn;
    if (matchGroup.some(([r, c]) => r === sRow && c === sCol))
      return [sRow, sCol];
  }
  return matchGroup[0];
}

// --- Modified findHintGem ---
// Always return the source gem.
const findHintGem = (brd) => {
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const directions = [
        [0, 1],
        [1, 0]
      ];
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow < numRows && newCol < numCols) {
          const testBoard = brd.map(r => r.map(gem => (gem ? { ...gem } : null)));
          [testBoard[row][col], testBoard[newRow][newCol]] = [testBoard[newRow][newCol], testBoard[row][col]];
          if (findMatches(testBoard).length > 0) {
            return { row, col };
          }
        }
      }
    }
  }
  return null;
};

// --- New Disco Swap Logic ---
// Pass the current board as an argument.
const handleDiscoSwap = (
  currentBoard,
  gem1,
  gem2,
  r1,
  c1,
  r2,
  c2,
  setBoard,
  addScore,
  spawnExplosion
) => {
  const newBoard = currentBoard.map(row => [...row]);
  // Case 1: Both swapped gems are Disco.
  if (gem1.special === "disco" && gem2.special === "disco") {
    let additionalScore = 0;
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const g = newBoard[i][j];
        if (g) {
          if (g.special === "disco") {
            additionalScore += 20000;
            spawnExplosion(i, j, "+20000", g.color);
          } else {
            additionalScore += 150 * 3;
            spawnExplosion(i, j, `+${150 * 3}`, g.color);
          }
          newBoard[i][j] = null;
        }
      }
    }
    addScore(additionalScore);
    const finalBoard = dropGemsFully(newBoard);
    animateGravitySmooth(newBoard, finalBoard, setBoard, (finalBoard) => {
      processMatches(finalBoard, setBoard, addScore);
    });
  } else {
    // Case 2: One Disco and one Standard gem.
    let standardColor;
    if (gem1.special === "disco") {
      standardColor = gem2.color;
      spawnExplosion(r1, c1, "+10000", gem1.color);
      newBoard[r1][c1] = null;
    } else {
      standardColor = gem1.color;
      spawnExplosion(r2, c2, "+10000", gem2.color);
      newBoard[r2][c2] = null;
    }
    let additionalScore = 10000;
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const g = newBoard[i][j];
        if (g && g.color === standardColor) {
          additionalScore += 150 * 2;
          spawnExplosion(i, j, `+${150 * 2}`, g.color);
          newBoard[i][j] = null;
        }
      }
    }
    addScore(additionalScore);
    const finalBoard = dropGemsFully(newBoard);
    animateGravitySmooth(newBoard, finalBoard, setBoard, (finalBoard) => {
      processMatches(finalBoard, setBoard, addScore);
    });
  }
};

// --- Final Hurrah: Explode ALL Special Gems Recursively ---
// This function clears ALL special gems and their chain reactions.
// For a disco gem, choose a random color from gemColors and remove all gems of that color.
const explodeSpecialsAndFinish = (currentBoard, setBoard, addScore, spawnExplosion, onFinalHurrahComplete) => {
  // Create a fresh copy of the board.
  const newBoard = currentBoard.map(row => [...row]);
  let additionalScore = 0;
  let specialsFound = false;
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const g = newBoard[i][j];
      if (g && g.special) {
        specialsFound = true;
        if (g.special === "disco") {
          // For Disco, pick a random color and remove all gems with that color.
          const randomColor = gemColors[Math.floor(Math.random() * gemColors.length)];
          spawnExplosion(i, j, "+10000", g.color);
          newBoard[i][j] = null;
          additionalScore += 10000;
          for (let a = 0; a < numRows; a++) {
            for (let b = 0; b < numCols; b++) {
              const h = newBoard[a][b];
              if (h && h.color === randomColor) {
                additionalScore += 150 * 2;
                spawnExplosion(a, b, `+${150 * 2}`, h.color);
                newBoard[a][b] = null;
              }
            }
          }
        } else {
          // For any other special gem.
          spawnExplosion(i, j, "+5000", g.color);
          newBoard[i][j] = null;
          additionalScore += 5000;
        }
      }
    }
  }
  if (additionalScore > 0) {
    addScore(additionalScore);
  }
  // If there were any special gems, drop gems and animate gravity.
  const dropped = dropGemsFully(newBoard);
  animateGravitySmooth(newBoard, dropped, setBoard, (droppedBoard) => {
    // Check if new special gems appeared as a result.
    const specialsRemain = droppedBoard.some(row => row.some(g => g && g.special));
    if (specialsRemain) {
      // Continue exploding until no specials remain.
      explodeSpecialsAndFinish(droppedBoard, setBoard, addScore, spawnExplosion, onFinalHurrahComplete);
    } else {
      if (onFinalHurrahComplete) onFinalHurrahComplete();
    }
  });
};

const processMatches = (currentBoard, setBoard, addScore, options = {}) => {
  const matchGroups = findMatches(currentBoard);
  if (matchGroups.length > 0) {
    let boardAfterRemoval = currentBoard.map(row => [...row]);
    matchGroups.forEach(matchGroup => {
      const baseScore = matchGroup.length * 150;
      addScore(baseScore);
      if (matchGroup.length === 4 && !isLinear(matchGroup)) {
        let specialCoord = pickSpecialCoord(matchGroup, options.swappedIn);
        removeAllBut(boardAfterRemoval, matchGroup, specialCoord, options.spawnExplosion);
        boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
          color: "black",
          special: "black",
          id: Math.random().toString(36).substr(2, 9),
          image: specialGemSprites.black,
          fallOffset: 0,
          swapOffset: { x: 0, y: 0 }
        };
        return;
      }
      if (isLinear(matchGroup)) {
        const len = matchGroup.length;
        if (len === 3) {
          removeAll(boardAfterRemoval, matchGroup, options.spawnExplosion);
        } else if (len === 4) {
          let specialCoord = pickSpecialCoord(matchGroup, options.swappedIn);
          removeAllBut(boardAfterRemoval, matchGroup, specialCoord, options.spawnExplosion);
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: "flower",
            special: "flower",
            id: Math.random().toString(36).substr(2, 9),
            image: specialGemSprites.flower,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 }
          };
        } else {
          let specialCoord = pickSpecialCoord(matchGroup, options.swappedIn);
          removeAllBut(boardAfterRemoval, matchGroup, specialCoord, options.spawnExplosion);
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: "disco",
            special: "disco",
            id: Math.random().toString(36).substr(2, 9),
            image: specialGemSprites.disco,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 }
          };
        }
        return;
      }
      if (matchGroup.length === 5 && !isLinear(matchGroup)) {
        if (isTShapeGroup(matchGroup)) {
          let specialCoord = pickSpecialCoord(matchGroup, options.swappedIn);
          removeAllBut(boardAfterRemoval, matchGroup, specialCoord, options.spawnExplosion);
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: "star",
            special: "star",
            id: Math.random().toString(36).substr(2, 9),
            image: specialGemSprites.star,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 }
          };
          return;
        } else if (isLShapeGroup(matchGroup)) {
          let specialCoord = pickSpecialCoord(matchGroup, options.swappedIn);
          removeAllBut(boardAfterRemoval, matchGroup, specialCoord, options.spawnExplosion);
          boardAfterRemoval[specialCoord[0]][specialCoord[1]] = {
            color: "glow",
            special: "glow",
            id: Math.random().toString(36).substr(2, 9),
            image: specialGemSprites.glow,
            fallOffset: 0,
            swapOffset: { x: 0, y: 0 }
          };
          return;
        } else {
          removeAll(boardAfterRemoval, matchGroup, options.spawnExplosion);
          return;
        }
      }
      removeAll(boardAfterRemoval, matchGroup, options.spawnExplosion);
    });
    const finalBoard = dropGemsFully(boardAfterRemoval);
    animateGravitySmooth(boardAfterRemoval, finalBoard, setBoard, (newBoard) => {
      processMatches(newBoard, setBoard, addScore, options);
    });
  } else {
    if (!hasPossibleMoves(currentBoard)) {
      console.log("No possible moves found, shuffling the board!");
      if (options.setIsTimerPaused) options.setIsTimerPaused(true);
      if (options.setIsShuffling) options.setIsShuffling(true);
      const newShuffledBoard = shuffleBoard(currentBoard);
      animateShuffle(currentBoard, newShuffledBoard, setBoard, 2000, (finalBoard) => {
        if (options.setIsShuffling) options.setIsShuffling(false);
        if (options.setIsTimerPaused) options.setIsTimerPaused(false);
        setBoard(finalBoard);
        processMatches(finalBoard, setBoard, addScore, options);
      });
    }
  }
};

const hasPossibleMoves = (brd) => {
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const directions = [
        [0, 1],
        [1, 0],
      ];
      for (let [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow < numRows && newCol < numCols) {
          const testBoard = brd.map(r => r.map(gem => (gem ? { ...gem } : null)));
          [testBoard[row][col], testBoard[newRow][newCol]] = [
            testBoard[newRow][newCol],
            testBoard[row][col]
          ];
          if (findMatches(testBoard).length > 0) return true;
        }
      }
    }
  }
  return false;
};

const dragThreshold = 20;

const Board = ({
  onFirstSwap,
  addScore,
  isTimerPaused,
  setIsTimerPaused,
  timeIsUp,
  onFinalHurrahComplete,
}) => {
  const [board, setBoard] = useState(generateBoard);
  const [swapping, setSwapping] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const [hintGem, setHintGem] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const draggingGem = useRef(null);
  const startTouch = useRef(null);
  const firstSwapTriggered = useRef(false);
  const lastActionTime = useRef(Date.now());

  // Extend hint delay to 4000ms.
  useEffect(() => {
    if (!firstSwapTriggered.current) return;
    const id = setTimeout(() => {
      if (Date.now() - lastActionTime.current >= 4000) {
        const hint = findHintGem(board);
        if (hint) setHintGem(hint);
      }
    }, 4000);
    return () => clearTimeout(id);
  }, [board]);

  // Final Hurrah: When timeIsUp becomes true, disable input and trigger explosion of all specials.
  useEffect(() => {
    if (timeIsUp) {
      // Disable user input by not processing pointer events.
      setIsTimerPaused(true);
      explodeSpecialsAndFinish(board, setBoard, addScore, spawnExplosion, onFinalHurrahComplete);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeIsUp]);

  const spawnExplosion = (row, col, value, primaryColor) => {
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    const newExplosion = {
      id: Date.now() + Math.random(),
      x,
      y,
      value,
      primaryColor,
    };
    setExplosions((prev) => [...prev, newExplosion]);
  };

  // Final Hurrah Function – Recursive explosion of all special gems.
  const explodeSpecialsAndFinish = (currentBoard, setBoard, addScore, spawnExplosion, onFinalHurrahComplete) => {
    const newBoard = currentBoard.map((row) => [...row]);
    let additionalScore = 0;
    let specialsFound = false;
    for (let i = 0; i < numRows; i++) {
      for (let j = 0; j < numCols; j++) {
        const g = newBoard[i][j];
        if (g && g.special) {
          specialsFound = true;
          if (g.special === "disco") {
            const randomColor = gemColors[Math.floor(Math.random() * gemColors.length)];
            spawnExplosion(i, j, "+10000", g.color);
            newBoard[i][j] = null;
            additionalScore += 10000;
            for (let a = 0; a < numRows; a++) {
              for (let b = 0; b < numCols; b++) {
                const h = newBoard[a][b];
                if (h && h.color === randomColor) {
                  additionalScore += 150 * 2;
                  spawnExplosion(a, b, `+${150 * 2}`, h.color);
                  newBoard[a][b] = null;
                }
              }
            }
          } else {
            spawnExplosion(i, j, "+5000", g.color);
            newBoard[i][j] = null;
            additionalScore += 5000;
          }
        }
      }
    }
    if (additionalScore > 0) {
      addScore(additionalScore);
    }
    const dropped = dropGemsFully(newBoard);
    animateGravitySmooth(newBoard, dropped, setBoard, (droppedBoard) => {
      const specialsRemain = droppedBoard.some(row => row.some(g => g && g.special));
      if (specialsRemain) {
        explodeSpecialsAndFinish(droppedBoard, setBoard, addScore, spawnExplosion, onFinalHurrahComplete);
      } else {
        if (onFinalHurrahComplete) onFinalHurrahComplete();
      }
    });
  };

  // --- Pointer Handlers ---
  const handlePointerDown = (row, col) => (e) => {
    // If time is up, ignore further user input.
    if (timeIsUp) return;
    draggingGem.current = { row, col };
    const { clientX, clientY } = e;
    startTouch.current = { x: clientX, y: clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    // If time is up, ignore pointer moves.
    if (timeIsUp) return;
    if (!startTouch.current || !draggingGem.current) return;
    if (!firstSwapTriggered.current && onFirstSwap) {
      onFirstSwap();
      firstSwapTriggered.current = true;
    }
    const { clientX, clientY } = e;
    const dx = clientX - startTouch.current.x;
    const dy = clientY - startTouch.current.y;
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
      const gem1 = board[r1][c1];
      const gem2 = board[r2][c2];
      // Let the swap animate first.
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
        if (gem1.special === "disco" || gem2.special === "disco") {
          handleDiscoSwap(board, gem1, gem2, r1, c1, r2, c2, setBoard, addScore, spawnExplosion);
          setSwapping(null);
          return;
        }
        if (findMatches(testBoard).length > 0) {
          setBoard(testBoard);
          setSwapping(null);
          processMatches(testBoard, setBoard, addScore, {
            swappedIn: [r2, c2],
            spawnExplosion,
            setIsShuffling,
            setIsTimerPaused,
          });
        } else {
          const reversedBoard = board.map(row =>
            row.map(g => ({ ...g, swapOffset: { x: 0, y: 0 } }))
          );
          setBoard(reversedBoard);
          setTimeout(() => setSwapping(null), 200);
        }
      }, 200);
      lastActionTime.current = Date.now();
      setHintGem(null);
      draggingGem.current = null;
      startTouch.current = null;
    }
  };

  const handlePointerUp = (e) => {
    if (timeIsUp) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    draggingGem.current = null;
    startTouch.current = null;
  };

  return (
    <div className="board-container" style={{ position: "relative" }}>
      {isShuffling && <ShuffleModal />}
      <div className="match3_board" style={{ overflow: "hidden" }}>
        {board.map((row, rowIndex) =>
          row.map((gem, colIndex) => {
            const isHint =
              hintGem && hintGem.row === rowIndex && hintGem.col === colIndex;
            if (!gem) {
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`match3_gem${gem?.special ? ` special ${gem.special}` : ""}`}
                />
              );
            }
            return (
              <div
                key={gem.id}
                className={`match3_gem${gem.special ? ` special ${gem.special}` : ""}${isHint ? " hint" : ""}`}
                onPointerDown={handlePointerDown(rowIndex, colIndex)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{
                  transform: `translateY(${gem.fallOffset + (gem.swapOffset?.y || 0)}px) translateX(${gem.swapOffset?.x || 0}px)`,
                  transition: swapping ? "transform 0.2s ease" : "transform 0.05s linear",
                }}
              >
                <img
                  src={gem.image}
                  alt={gem.special ? `${gem.special}-gem` : `${gem.color}-gem`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            );
          })
        )}
      </div>
      {explosions.map(exp => (
        <Explosion
          key={exp.id}
          id={exp.id}
          x={exp.x}
          y={exp.y}
          value={exp.value}
          primaryColor={exp.primaryColor}
          onComplete={(id) => setExplosions(prev => prev.filter(exp => exp.id !== id))}
        />
      ))}
    </div>
  );
};

export default Board;
