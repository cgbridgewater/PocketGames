import { useRef, useEffect, useState } from 'react';
import { BOX_HEIGHT, CANVAS_WIDTH, INITIAL_BOX_WIDTH, INITIAL_X_SPEED, INITIAL_Y_SPEED } from '../utils/Constants';
import { createStepColor, drawBackground, drawBoxes, drawDebris, gameOver } from '../utils/GameLogic';


export function useGame() {
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const [score, setScore] = useState(1);
  const [isWinningModalOpen, setIsWinningModalOpen] = useState(false);
  const currentRef = useRef(1);
  const modeRef = useRef('bounce');
  const scrollRef = useRef(0);
  const cameraRef = useRef(0);
  const xSpeedRef = useRef(INITIAL_X_SPEED);
  const ySpeedRef = useRef(INITIAL_Y_SPEED);
  const boxesRef = useRef([]);
  const debrisRef = useRef({ x: 0, y: 0, width: 0 });
  const animationId = useRef(0);

  // Function to initialize the game state
  const initializeGameState = () => {
    boxesRef.current = [{
      x: (CANVAS_WIDTH / 2) - (INITIAL_BOX_WIDTH / 2),
      y: 200,
      width: INITIAL_BOX_WIDTH,
      color: '#C23866',
    }];

    debrisRef.current = { x: 0, y: 0, width: 0 };
    currentRef.current = 1;
    modeRef.current = 'bounce';
    xSpeedRef.current = INITIAL_X_SPEED;
    ySpeedRef.current = INITIAL_Y_SPEED;
    scrollRef.current = 0;
    cameraRef.current = 0;

    createNewBox();
    setScore(1);
    setIsWinningModalOpen(false);  // Close the modal when the game starts
  };

  // Function to restart the game
  const restartGame = () => {
    // Cancel the previous animation frame if there's any ongoing animation
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }

    // Reset the game state
    initializeGameState();  // Reset all game-related states
    draw();  // Restart the drawing loop
    setIsWinningModalOpen(false);  // Close the modal
  };

  // Main drawing function
  function draw() {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    if (modeRef.current === 'gameover') return;

    drawBackground(context);
    drawBoxes(context, boxesRef.current, cameraRef.current);
    drawDebris(context, debrisRef.current, cameraRef.current);

    if (modeRef.current === 'bounce') {
      moveAndDetectCollision();
    } else if (modeRef.current === 'fall') {
      updateFallMode();
    }

    debrisRef.current.y -= ySpeedRef.current;
    updateCamera();

    animationId.current = requestAnimationFrame(draw);
  }

  // Helper function for updating the camera position (Tower Drop Speed Control)
  function updateCamera() {
    if (scrollRef.current > 0) {
      cameraRef.current+=2.5;
      scrollRef.current-=2.5;
    }
  }

  // Create a new box when needed
  function createNewBox() {
    boxesRef.current = [...boxesRef.current, {
      x: 0,
      y: (currentRef.current + 5) * BOX_HEIGHT,
      width: boxesRef.current[currentRef.current - 1].width,
      color: createStepColor(currentRef.current),
    }];
  }

  // Function to handle box landing and create debris
  function createNewDebris(difference) {
    const currentBox = boxesRef.current[currentRef.current];
    const previousBox = boxesRef.current[currentRef.current - 1];

    const debrisX = currentBox.x > previousBox.x
      ? currentBox.x + currentBox.width
      : currentBox.x;

    debrisRef.current = {
      x: debrisX,
      y: currentBox.y,
      width: difference,
    };
  }

  // Update the box when it falls
  function updateFallMode() {
    const currentBox = boxesRef.current[currentRef.current];
    currentBox.y -= ySpeedRef.current;

    const positionPreviousBox = boxesRef.current[currentRef.current - 1].y + BOX_HEIGHT;

    if (currentBox.y <= positionPreviousBox) {
      handleBoxLanding();
    }
  }

  // Adjust the current box size and position when it lands
  function adjustCurrentBox(difference) {
    const currentBox = boxesRef.current[currentRef.current];
    const previousBox = boxesRef.current[currentRef.current - 1];

    if (currentBox.x > previousBox.x) {
      currentBox.width -= difference;
    } else {
      currentBox.width += difference;
      currentBox.x = previousBox.x;
    }
  }

  // Handle when a box lands, checking for collisions and updating the game state
  function handleBoxLanding() {
    const currentBox = boxesRef.current[currentRef.current];
    const previousBox = boxesRef.current[currentRef.current - 1];

    const difference = currentBox.x - previousBox.x;

    if (Math.abs(difference) >= currentBox.width) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      gameOver(context);
      modeRef.current = 'gameover';
      setIsWinningModalOpen(true);
      return;
    }

    adjustCurrentBox(difference);
    createNewDebris(difference);

    xSpeedRef.current += xSpeedRef.current > 0 ? 1 : -1;
    currentRef.current += 1;
    scrollRef.current = BOX_HEIGHT;
    modeRef.current = 'bounce';

    setScore(currentRef.current);

    createNewBox();
  }

  // Detect and handle collisions while moving the box
  function moveAndDetectCollision() {
    const currentBox = boxesRef.current[currentRef.current];
    currentBox.x += xSpeedRef.current;

    const isMovingRight = xSpeedRef.current > 0;
    const isMovingLeft = xSpeedRef.current < 0;

    const hasHitRightSide = currentBox.x + currentBox.width > CANVAS_WIDTH;
    const hasHitLeftSide = currentBox.x < 0;

    if ((isMovingRight && hasHitRightSide) || (isMovingLeft && hasHitLeftSide)) {
      xSpeedRef.current = -xSpeedRef.current;
    }
  }

  // Handle user input (restart or start fall mode)
  function handleInput() {
    if (modeRef.current === 'gameover') {
      restartGame(); // Call the restartGame function when the game is over
    } else if (modeRef.current === 'bounce') {
      modeRef.current = 'fall';
    }
  }

  // Initialize the game state
  useEffect(() => {
    initializeGameState();
    draw();  // Start the game draw loop

    // Add event listeners
    const canvas = canvasRef.current;
    canvas.addEventListener('pointerdown', handleInput);
    document.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        handleInput();
      }
    });

    // Cleanup event listeners on component unmount
    return () => {
      canvas.removeEventListener('pointerdown', handleInput);
      document.removeEventListener('keydown', handleInput);
      window.cancelAnimationFrame(animationId.current);
    };
  }, []);  // Empty dependency array ensures this effect runs only once on mount

  return { canvasRef, scoreRef, score, isWinningModalOpen, setIsWinningModalOpen, restartGame };
}
