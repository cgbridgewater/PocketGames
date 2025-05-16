// src/components/MatchThreeBoard.jsx
import React, { useRef, useEffect, useState } from 'react';
import GemBlue from '../../assets/images/GemBlue.webp';
import GemGreen from '../../assets/images/GemGreen.webp';
import GemYellow from '../../assets/images/GemYellow.webp';
import GemRed from '../../assets/images/GemRed.webp';
import GemOrange from '../../assets/images/GemOrange.webp';
import GemPurple from '../../assets/images/GemPurple.webp';
import GemWhite from '../../assets/images/GemWhite.webp';


const gemSprites = {
    blue: GemBlue,
    green: GemGreen,
    yellow: GemYellow,
    red: GemRed,
    orange: GemOrange,
    purple: GemPurple,
    white: GemWhite,
  };
  
  const gemColors = Object.keys(gemSprites);
  const numRows = 9;
  const numCols = 9;
  
  const calculateCanvasSize = () => {
    const screenWidth = window.innerWidth;
    const totalWidth = screenWidth < 600 ? 360 : 450;
    const cellSize = Math.floor(totalWidth / numCols);
    return { width: cellSize * numCols, height: cellSize * numRows, cellSize };
  };
  
  const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    return img;
  };
  
  const createRandomGem = () => {
    const color = gemColors[Math.floor(Math.random() * gemColors.length)];
    return {
      color,
      image: loadImage(gemSprites[color]),
      id: Math.random().toString(36).substr(2, 9),
    };
  };
  
  const findSimpleMatches = (board) => {
    const matches = [];
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols - 2; col++) {
        const c = board[row][col].color;
        if (c === board[row][col + 1].color && c === board[row][col + 2].color) {
          matches.push([[row, col], [row, col + 1], [row, col + 2]]);
        }
      }
    }
    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows - 2; row++) {
        const c = board[row][col].color;
        if (c === board[row + 1][col].color && c === board[row + 2][col].color) {
          matches.push([[row, col], [row + 1, col], [row + 2, col]]);
        }
      }
    }
    return matches;
  };
  
  const generateCleanBoard = () => {
    let board;
    do {
      board = Array.from({ length: numRows }, () =>
        Array.from({ length: numCols }, () => createRandomGem())
      );
    } while (findSimpleMatches(board).length > 0);
    return board;
  };
  
  const MatchThreeBoard = () => {
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());
    const [board, setBoard] = useState(null);
  
    useEffect(() => {
      const handleResize = () => {
        const size = calculateCanvasSize();
        setCanvasSize(size);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    useEffect(() => {
      const newBoard = generateCleanBoard();
      setBoard(newBoard);
    }, []);
  
    useEffect(() => {
      if (!board) return;
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const gem = board[row][col];
          if (gem.image.complete) {
            ctx.drawImage(
              gem.image,
              col * canvasSize.cellSize,
              row * canvasSize.cellSize,
              canvasSize.cellSize,
              canvasSize.cellSize
            );
          } else {
            gem.image.onload = () => {
              ctx.drawImage(
                gem.image,
                col * canvasSize.cellSize,
                row * canvasSize.cellSize,
                canvasSize.cellSize,
                canvasSize.cellSize
              );
            };
          }
        }
      }
    }, [board, canvasSize]);
  
    return (
      <div className="canvas_wrapper" style={{ width: canvasSize.width, height: canvasSize.height }}>
        {!board && <div className="canvas_loader">Loading board...</div>}
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ display: 'block', border: '2px solid var(--border_trim)' }}
        />
      </div>
    );
  };
  
  export default MatchThreeBoard;