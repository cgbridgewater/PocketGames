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
const HINT_DELAY = 2500;
const SWAP_DURATION = 100;

const CanvasBoard = ({ boardKey, onFirstSwap, addScore, isTimerPaused }) => {
  const canvasRef = useRef(null);
  const dragStartRef = useRef(null);
  const swapRef = useRef(null);
  const animRef = useRef(null);
  const hintTimerRef = useRef(null);
  const imageCache = useRef({});

  const [board, setBoard] = useState([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [hint, setHint] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // preload images
    const imgs = GEM_COLORS.map(color => {
      const img = new Image();
      img.src = SPRITES[color];
      imageCache.current[color] = img;
      return img;
    });
    Promise.all(imgs.map(img => new Promise(res => img.onload = res)))
      .then(() => setImagesLoaded(true));
  }, []);

  useEffect(() => {
    // reset board
    setBoard(generateBoardWithoutInitialMatches());
    setHint(null);
    setHasStarted(false);
  }, [boardKey]);

  const handleMatches = b => {
    const matches = findMatches(b);
    if (!matches.length) return false;
    setHint(null);
    const newB = b.map(row => [...row]);
    matches.forEach(({ cells }) =>
      cells.forEach(([r, c]) => {
        newB[r][c] = null;
        addScore && addScore(50);
      })
    );
    setTimeout(() => {
      const collapsed = applyGravity(newB);
      setBoard(collapsed);
      setTimeout(() => handleMatches(collapsed), 200);
    }, 200);
    return true;
  };

  const isValidSwap = (b, r1, c1, r2, c2) => {
    const test = b.map(row => [...row]);
    [test[r1][c1], test[r2][c2]] = [test[r2][c2], test[r1][c1]];
    return findMatches(test).length > 0;
  };

  const draw = timestamp => {
    const canvas = canvasRef.current;
    if (!imagesLoaded || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = CELL_SIZE * NUM_COLS;
    canvas.height = CELL_SIZE * NUM_ROWS;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw board
    board.forEach((row, r) => row.forEach((gem, c) => {
      if (gem) ctx.drawImage(imageCache.current[gem.color], c*CELL_SIZE, r*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }));

    // swap animation
    if (swapRef.current) {
      const { from, to, start, valid, reversed } = swapRef.current;
      const t = Math.min((timestamp - start) / SWAP_DURATION, 1);
      const [r1, c1] = from;
      const [r2, c2] = to;
      const x1 = c1*CELL_SIZE + (c2-c1)*CELL_SIZE*t;
      const y1 = r1*CELL_SIZE + (r2-r1)*CELL_SIZE*t;
      const x2 = c2*CELL_SIZE + (c1-c2)*CELL_SIZE*t;
      const y2 = r2*CELL_SIZE + (r1-r2)*CELL_SIZE*t;
      // clear orig
      ctx.clearRect(c1*CELL_SIZE, r1*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.clearRect(c2*CELL_SIZE, r2*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      // draw moving
      ctx.drawImage(imageCache.current[board[r1][c1].color], x1, y1, CELL_SIZE, CELL_SIZE);
      ctx.drawImage(imageCache.current[board[r2][c2].color], x2, y2, CELL_SIZE, CELL_SIZE);
      if (t < 1) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      // finish
      if (!reversed) {
        if (valid) {
          const nb = board.map(row => [...row]);
          [nb[r1][c1], nb[r2][c2]] = [nb[r2][c2], nb[r1][c1]];
          setBoard(nb);
          handleMatches(nb) || setHint(null);
          swapRef.current = null;
        } else {
          swapRef.current = { from: to, to: from, start: performance.now(), valid: false, reversed: true };
          animRef.current = requestAnimationFrame(draw);
          return;
        }
      } else {
        swapRef.current = null;
      }
    }

    // hint pulse
    if (hint) {
      const phase = Math.sin(timestamp/200);
      ctx.strokeStyle = phase>0?'cyan':'white'; ctx.lineWidth = 3;
      const r = 5;
      [hint.from, hint.to].forEach(([row,col])=>{
        const x=col*CELL_SIZE+2, y=row*CELL_SIZE+2, w=CELL_SIZE-4, h=CELL_SIZE-4;
        ctx.beginPath();
        ctx.moveTo(x+r,y);
        ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.stroke();
      });
    }

    animRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [board, imagesLoaded, hint]);

  useEffect(() => {
    clearTimeout(hintTimerRef.current);
    if (hasStarted) hintTimerRef.current = setTimeout(() => setHint(findHintMove(board)), HINT_DELAY);
    return () => clearTimeout(hintTimerRef.current);
  }, [board, hasStarted]);

  const handlePointerDown = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    dragStartRef.current = {
      row: Math.floor((e.clientY-rect.top)/CELL_SIZE),
      col: Math.floor((e.clientX-rect.left)/CELL_SIZE),
      x: e.clientX-rect.left,
      y: e.clientY-rect.top
    };
  };

  const handlePointerMove = e => {
    if (swapRef.current || !dragStartRef.current || isTimerPaused) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = e.clientX-rect.left - dragStartRef.current.x;
    const dy = e.clientY-rect.top - dragStartRef.current.y;
    if (Math.abs(dx)<SWIPE_THRESHOLD && Math.abs(dy)<SWIPE_THRESHOLD) return;
    const { row:r1, col:c1 } = dragStartRef.current;
    const r2 = dy>Math.abs(dx)?r1+1:dy<-Math.abs(dx)?r1-1:r1;
    const c2 = dx>Math.abs(dy)?c1+1:dx<-Math.abs(dy)?c1-1:c1;
    dragStartRef.current = null;
    if (r2<0||r2>=NUM_ROWS||c2<0||c2>=NUM_COLS) return;
    swapRef.current = { from:[r1,c1], to:[r2,c2], start:performance.now(), valid:isValidSwap(board,r1,c1,r2,c2), reversed:false };
    if (!hasStarted) { setHasStarted(true); onFirstSwap && onFirstSwap(); }
    setHint(null);
  };

  const handlePointerUp = () => { dragStartRef.current=null; };

  return (
    <div style={{margin:'0 auto',width:CELL_SIZE*NUM_COLS}} className="canvas_wrapper">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{touchAction:'none',display:'block'}}
      />
    </div>
  );
};

export default CanvasBoard;