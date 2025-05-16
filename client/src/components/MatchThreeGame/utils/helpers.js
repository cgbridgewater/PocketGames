// src/components/MatchThreeGame/utils/helpers.js

// Import gem images (ES modules)
import GemBlue from '../../../assets/images/GemBlue.webp';
import GemGreen from '../../../assets/images/GemGreen.webp';
import GemYellow from '../../../assets/images/GemYellow.webp';
import GemRed from '../../../assets/images/GemRed.webp';
import GemOrange from '../../../assets/images/GemOrange.webp';
import GemPurple from '../../../assets/images/GemPurple.webp';
import GemWhite from '../../../assets/images/GemWhite.webp';

// Core gem creation and board utilities
export const GEM_COLORS = ['blue','green','yellow','red','orange','purple','white'];
export const SPRITES = {
  blue: GemBlue,
  green: GemGreen,
  yellow: GemYellow,
  red: GemRed,
  orange: GemOrange,
  purple: GemPurple,
  white: GemWhite,
};

export const createGem = () => {
  const color = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
  return { color, image: SPRITES[color] };
};

// Utility for matching shapes
export const arraysEqual = (a, b) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export const normalizeGroup = (group, pivot) =>
  group.map(([r, c]) => [r - pivot[0], c - pivot[1]].toString()).sort();

const tShapes = [
  [[0,0],[0,1],[0,2],[1,1],[2,1]],
  [[0,0],[0,1],[0,2],[-1,1],[-2,1]],
  [[0,0],[1,0],[2,0],[1,1],[1,2]],
  [[0,0],[1,0],[2,0],[1,-1],[1,-2]],
].map(p => p.map(c => c.toString()).sort());

const lShapes = [
  [[0,0],[0,1],[0,2],[1,0],[2,0]],
  [[0,0],[0,-1],[0,-2],[1,0],[2,0]],
  [[0,0],[0,1],[0,2],[-1,0],[-2,0]],
  [[0,0],[0,-1],[0,-2],[-1,0],[-2,0]],
].map(p => p.map(c => c.toString()).sort());

export const isTShapeGroup = group => {
  if (group.length !== 5) return false;
  return group.some(pivot =>
    arraysEqual(normalizeGroup(group, pivot), tShapes.find(s => arraysEqual(normalizeGroup(group, pivot), s)) || [])
  );
};

export const isLShapeGroup = group => {
  if (group.length !== 5) return false;
  return group.some(pivot =>
    arraysEqual(normalizeGroup(group, pivot), lShapes.find(s => arraysEqual(normalizeGroup(group, pivot), s)) || [])
  );
};

export function findMatches(board) {
  const matches = [];
  const visited = Array.from({ length: board.length }, () => Array(board[0].length).fill(false));
  const R = board.length, C = board[0].length;

  // Horizontal & vertical lines
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      const start = c;
      const color = board[r][c]?.color;
      if (!color) { c++; continue; }
      while (c < C && board[r][c]?.color === color) c++;
      if (c - start >= 3) {
        const group = [];
        for (let i = start; i < c; i++) {
          group.push([r, i]); visited[r][i] = true;
        }
        matches.push({ type: `line${c - start}`, cells: group });
      }
    }
  }
  for (let c = 0; c < C; c++) {
    let r = 0;
    while (r < R) {
      const start = r;
      const color = board[r][c]?.color;
      if (!color) { r++; continue; }
      while (r < R && board[r][c]?.color === color) r++;
      if (r - start >= 3) {
        const group = [];
        for (let i = start; i < r; i++) {
          group.push([i, c]); visited[i][c] = true;
        }
        matches.push({ type: `line${r - start}`, cells: group });
      }
    }
  }

  // 2×2 squares
  for (let r = 0; r < R - 1; r++) {
    for (let c = 0; c < C - 1; c++) {
      const color = board[r][c]?.color;
      if (
        color &&
        board[r][c + 1]?.color === color &&
        board[r + 1][c]?.color === color &&
        board[r + 1][c + 1]?.color === color
      ) {
        const group = [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]];
        group.forEach(([rr, cc]) => visited[rr][cc] = true);
        matches.push({ type: 'square', cells: group });
      }
    }
  }

  // T & L shapes
  const coords = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (visited[r][c]) coords.push([r, c]);
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      for (let k = j + 1; k < coords.length; k++) {
        for (let l = k + 1; l < coords.length; l++) {
          for (let m = l + 1; m < coords.length; m++) {
            const group = [coords[i], coords[j], coords[k], coords[l], coords[m]];
            if (isTShapeGroup(group)) matches.push({ type: 'T', cells: group });
            else if (isLShapeGroup(group)) matches.push({ type: 'L', cells: group });
          }
        }
      }
    }
  }

  return matches;
}

export function findHintMove(board) {
  const R = board.length, C = board[0].length;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr, c2 = c + dc;
        if (r2 < R && c2 < C) {
          const test = board.map(row => [...row]);
          [test[r][c], test[r2][c2]] = [test[r2][c2], test[r][c]];
          if (findMatches(test).length) return { from: [r, c], to: [r2, c2] };
        }
      }
    }
  }
  return null;
}

export const shuffleBoard = board => {
  const flat = board.flat();
  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }
  const newB = [];
  while (flat.length) newB.push(flat.splice(0, board[0].length));
  return newB;
};

export const applyGravity = board => {
  const R = board.length, C = board[0].length;
  const newB = board.map(r => [...r]);
  for (let c = 0; c < C; c++) {
    let fill = R - 1;
    for (let r = R - 1; r >= 0; r--) {
      if (newB[r][c]) {
        newB[fill][c] = newB[r][c];
        if (fill !== r) newB[r][c] = null;
        fill--;
      }
    }
    for (let r = fill; r >= 0; r--) newB[r][c] = createGem();
  }
  return newB;
};

export const generateBoardWithoutInitialMatches = () => {
  let board;
  do {
    board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, createGem));
  } while (findMatches(board).length > 0);
  return board;
};

// ——————————————————————————
// Note: All CanvasBoard.jsx code should live in src/components/MatchThreeGame/CanvasBoard.jsx
// and not be pasted into this helpers.js file.
// Separate files:
// - utils/helpers.js (helper functions only)
// - CanvasBoard.jsx (component implementation)

// CanvasBoard.jsx should import from './utils/helpers' and contain only the React component code.
