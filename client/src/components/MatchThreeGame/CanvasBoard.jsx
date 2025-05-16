// src/components/MatchThreeGame/CanvasBoard.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  findMatches,
  findHintMove,
  shuffleBoard,
  applyGravity,
  generateBoardWithoutInitialMatches,
  GEM_COLORS,
  SPRITES
} from './utils/helpers';

const NUM_ROWS = 9;
const NUM_COLS = 9;
const CELL_SIZE = 38;
const SWIPE_THRESHOLD = 5;
const HINT_DELAY = 2500; // ms
const SWAP_DURATION = 100; // ms per swap animation

const CanvasBoard = ({ boardKey, onFirstSwap, addScore, isTimerPaused }) => {
  const canvasRef = useRef(null);
  const dragStartRef = useRef(null);
  const swapRef = useRef(null);
  const animationRef = useRef(null);
  const hintTimerRef = useRef(null);
  const imageCache = useRef({});

  const [board, setBoard] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [hint, setHint] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Preload gem images
  useEffect(() => {
    const imgs = GEM_COLORS.map(color => {
      const img = new Image();
      img.src = SPRITES[color];
      imageCache.current[color] = img;
      return img;
    });
    Promise.all(imgs.map(img => new Promise(res => (img.onload = res)))).then(() =>
      setImagesLoaded(true)
    );
  }, []);

  // Initialize or reset board
  useEffect(() => {
    setBoard(generateBoardWithoutInitialMatches());
    setHint(null);
    setHasStarted(false);
  }, [boardKey]);

  // Clear matches recursively
  const handleMatches = b => {
    const matches = findMatches(b);
    if (matches.length === 0) return false;
    setHint(null);
    const newB = b.map(row => [...row]);
    matches.forEach(({ cells }) => {
      cells.forEach(([r, c]) => {
        newB[r][c] = null;
        if (addScore) addScore(50);
      });
    });
    setTimeout(() => {
      const collapsed = applyGravity(newB);
      setBoard(collapsed);
      setTimeout(() => handleMatches(collapsed), 200);
    }, 200);
    return true;
  };

  // Check if a swap creates a match
  const isValidSwap = (b, r1, c1, r2, c2) => {
    const test = b.map(row => [...row]);
    [test[r1][c1], test[r2][c2]] = [test[r2][c2], test[r1][c1]];
    return findMatches(test).length > 0;
  };

  // Main draw loop
  const draw = timestamp => {
    const canvas = canvasRef.current;
    if (!imagesLoaded || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = CELL_SIZE * NUM_COLS;
    canvas.height = CELL_SIZE * NUM_ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw static gems
    board.forEach((row, r) =>
      row.forEach((gem, c) => {
        if (!gem) return;
        ctx.drawImage(imageCache.current[gem.color], c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      })
    );

    // Animate swap if exists
    if (swapRef.current) {
      const { from, to, start, valid, reversed } = swapRef.current;
      const t = Math.min((timestamp - start) / SWAP_DURATION, 1);
      const [r1, c1] = from;
      const [r2, c2] = to;
      const x1 = c1 * CELL_SIZE + (c2 - c1) * CELL_SIZE * t;
      const y1 = r1 * CELL_SIZE + (r2 - r1) * CELL_SIZE * t;
      const x2 = c2 * CELL_SIZE + (c1 - c2) * CELL_SIZE * t;
      const y2 = r2 * CELL_SIZE + (r1 - r2) * CELL_SIZE * t;
      // clear their cells
      ctx.clearRect(c1 * CELL_SIZE, r1 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.clearRect(c2 * CELL_SIZE, r2 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      // draw moving
      ctx.drawImage(imageCache.current[board[r1][c1].color], x1, y1, CELL_SIZE, CELL_SIZE);
      ctx.drawImage(imageCache.current[board[r2][c2].color], x2, y2, CELL_SIZE, CELL_SIZE);
      if (t < 1) {
        animationRef.current = requestAnimationFrame(draw);
      } else {
        // finish swap
        if (!reversed) {
          if (valid) {
            const nb = board.map(row => [...row]);
            [nb[r1][c1], nb[r2][c2]] = [nb[r2][c2], nb[r1][c1]];
            setBoard(nb);
            handleMatches(nb) || setHint(null);
            swapRef.current = null;
          } else {
            // reverse invalid swap
            swapRef.current = { from: to, to: from, start: performance.now(), valid: false, reversed: true };
            animationRef.current = requestAnimationFrame(draw);
          }
        } else {
          // reversed complete
          swapRef.current = null;
        }
      }
      return;
    }

    // Draw hint pulse
    if (hint) {
      const phase = Math.sin(timestamp / 200);
      ctx.strokeStyle = phase > 0 ? 'cyan' : 'white';
      ctx.lineWidth = 3;
      const radius = 5;
      [hint.from, hint.to].forEach(([r, c]) => {
        const x = c * CELL_SIZE + 2;
        const y = r * CELL_SIZE + 2;
        const w = CELL_SIZE - 4;
        const h = CELL_SIZE - 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.stroke();
      });
    }

    animationRef.current = requestAnimationFrame(draw);
  };

  // Kick off animation
  useEffect(() => {
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [board, imagesLoaded, hint]);

  // Hint scheduling
  useEffect(() => {
    clearTimeout(hintTimerRef.current);
    if (hasStarted) {
      hintTimerRef.current = setTimeout(() => setHint(findHintMove(board)), HINT_DELAY);
    }
    return () => clearTimeout(hintTimerRef.current);
  }, [board, hasStarted]);

  // Pointer down
  const handlePointerDown = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    dragStartRef.current = {
      row: Math.floor((e.clientY - rect.top) / CELL_SIZE),
      col: Math.floor((e.clientX - rect.left) / CELL_SIZE),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

    // Pointer move to start swap
  const handlePointerMove = (e) => {
    // do nothing while swap anim in progress
    if (swapRef.current) return;
    if (!dragStartRef.current || isTimerPaused) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX - rect.left - dragStartRef.current.x;
    const dy = e.clientY - rect.top - dragStartRef.current.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
    const { row: r1, col: c1 } = dragStartRef.current;
    const r2 = dy > Math.abs(dx) ? r1 + 1 : dy < -Math.abs(dx) ? r1 - 1 : r1;
    const c2 = dx > Math.abs(dy) ? c1 + 1 : dx < -Math.abs(dy) ? c1 - 1 : c1;
    dragStartRef.current = null;
    if (r2 < 0 || r2 >= NUM_ROWS || c2 < 0 || c2 >= NUM_COLS) return;
    const valid = isValidSwap(board, r1, c1, r2, c2);
    swapRef.current = { from: [r1, c1], to: [r2, c2], start: performance.now(), valid, reversed: false };
    if (!hasStarted) {
      setHasStarted(true);
      onFirstSwap && onFirstSwap();
    }
    setHint(null);
  };

  // Pointer up clears drag
  const handlePointerUp = () => { dragStartRef.current = null; };

  return (
    <div style={{ margin: '0 auto', width: CELL_SIZE * NUM_COLS }} className="canvas_wrapper">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none', display: 'block' }}
      />
    </div>
  );
};

export default CanvasBoard;
