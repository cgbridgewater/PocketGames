// IMPORT REACT MAGIC
import React, { useRef, useEffect, useState } from 'react';

// IMPORT SUBCOMPONENTS
import Header from '../components/GameHeader/GameHeader';
import WinningModal from '../components/Modals/WinningModal';

// IMPORT IMAGES
import bubbleSpritePath from '../assets/images/bubble-sprites.png';

// Border colors matching your bubble sprite order with Type 6 updated.
const borderColors = [
  "#660000", // Type 0: RED -> dark red
  "#004d00", // Type 1: GREEN -> dark green
  "#000033", // Type 2: DARK BLUE -> very dark blue
  "#666600", // Type 3: YELLOW -> muted dark yellow
  "#3F007F", // Type 4: PURPLE -> dark purple
  "#003366", // Type 5: LIGHT BLUE -> darkened light blue
  "#fafafa"  // Type 6: WHITE -> updated to #fafafa
];

// Scoring constants
const BASE_SCORE = 100;
const BANK_SHOT_MULTIPLIER = 1.25;
const NON_MATCH_MULTIPLIER = 2;
const MATCH_MULTIPLIER = 1.0;
const CLUSTER_BONUS_THRESHOLD = 8;
const CLUSTER_BONUS_SCORE = 2000;

// Bubble control
const MIN_BUBBLE_COUNT = 1; // Force a new row if board is nearly empty.
const INITIAL_THRESHOLD = 18; // Initial move threshold
const MINTHRESHOLD = 3;
const THRESHOLDCHANGE = 3;

export default function BubbleBlast({
  isWinningModalOpen,
  setIsWinningModalOpen,
  isTimerPaused,
  setIsTimerPaused,
}) {
  const canvasRef = useRef(null);
  // State for score, FPS, move counter, threshold display, and timer.
  const [scoreState, setScoreState] = useState(0);
  const [fpsState, setFpsState] = useState(0);
  const [counter, setCounter] = useState(0);
  const [thresholdState, setThresholdState] = useState(INITIAL_THRESHOLD);
  // Timer state: starting at 120 seconds (2:00)
  const [timeLeft, setTimeLeft] = useState(120);
  // New state to control when the clock should start (only after the first shot).
  const [gameStarted, setGameStarted] = useState(false);

  // Use a ref to hold the current move threshold so it can be updated without re-rendering.
  const currentThresholdRef = useRef(INITIAL_THRESHOLD);

  // Create a ref to hold the current time without triggering re-renders.
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // We'll store a ref to the newGame() function so Header/Modal can call it.
  const newGameRef = useRef(null);

  // Reset function: resets all game state, the timer, current threshold, and closes the modal.
  const resetGame = () => {
    if (newGameRef.current) newGameRef.current();
    setIsWinningModalOpen(false);
    setTimeLeft(120);
    setGameStarted(false);
    currentThresholdRef.current = INITIAL_THRESHOLD;
    setThresholdState(INITIAL_THRESHOLD);
  };

  // Timer effect: decrease the time every second when the game has started,
  // is not paused, and the game isn't over.
  useEffect(() => {
    if (gameStarted && !isTimerPaused && !isWinningModalOpen) {
      const timerInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerInterval);
            // When the clock runs out, end the game.
            setIsWinningModalOpen(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timerInterval);
    }
  }, [gameStarted, isTimerPaused, isWinningModalOpen]);

  // ------------------------------
  // Game code starts here
  // ------------------------------
  // Note: timeLeft is removed from the dependency array to prevent reinitialization.
  useEffect(() => {
    setIsWinningModalOpen(false);
    setTimeLeft(120);
    let isAiming = false; // Track if user is holding down for aiming

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Timing and FPS variables.
    let lastframe = 0;
    let fpstime = 0;
    let framecount = 0;
    let fps = 0;
    let initialized = false;

    // Level configuration.
    const level = {
      x: 3,
      y: 3,
      width: 0,
      height: 0,
      columns: 10,
      rows: 14,
      tilewidth: 32,
      tileheight: 32,
      rowheight: 27.2,
      radius: 16,
      tiles: [],
    };

    // Instead of a single global row offset, use an array for each row's offset.
    let rowOffsets = [];
    for (let j = 0; j < level.rows; j++) {
      rowOffsets[j] = j % 2;
    }

    // Define Tile class.
    class Tile {
      constructor(x, y, type, shift) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.removed = false;
        this.shift = shift;
        this.velocity = 0;
        this.alpha = 1;
        this.processed = false;
      }
    }

    // Player object.
    const player = {
      x: 0,
      y: 0,
      angle: 0,
      tiletype: 0,
      bubble: {
        x: 0,
        y: 0,
        angle: 0,
        // The speed will be updated dynamically.
        speed: 600,
        dropspeed: 900,
        tiletype: 0,
        visible: false,
        bankShot: false, // Persistent bank shot flag.
      },
      nextbubble: {
        x: 0,
        y: 0,
        tiletype: 0,
      },
    };

    // Neighbor offset table.
    const neighborsoffsets = [
      [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]],
      [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]],
    ];

    const bubblecolors = 7;

    const gamestates = {
      init: 0,
      ready: 1,
      shootbubble: 2,
      removecluster: 3,
      gameover: 4,
    };
    let gamestate = gamestates.init;

    let score = 0;
    let turncounter = 0;

    let animationstate = 0;
    let animationtime = 0;

    let cluster = [];
    let floatingclusters = [];

    let images = [];
    let bubbleimage;
    let loadcount = 0;
    let loadtotal = 0;
    let preloaded = false;

    // ----------------------------------
    // Image loading function.
    // ----------------------------------
    function loadImages(imagefiles) {
      loadcount = 0;
      loadtotal = imagefiles.length;
      preloaded = false;
      const loadedimages = [];
      for (let i = 0; i < imagefiles.length; i++) {
        const image = new Image();
        image.onload = function () {
          loadcount++;
          if (loadcount === loadtotal) {
            preloaded = true;
          }
        };
        image.src = imagefiles[i];
        loadedimages[i] = image;
      }
      return loadedimages;
    }

    function getTileCoordinate(column, row) {
      let tilex = level.x + column * level.tilewidth;
      if (rowOffsets[row] === 1) {
        tilex += level.tilewidth / 2;
      }
      const tiley = level.y + row * level.rowheight;
      return { tilex, tiley };
    }

    function getNeighbors(tile) {
      const n = neighborsoffsets[rowOffsets[tile.y]];
      const neighbors = [];
      for (let i = 0; i < n.length; i++) {
        const nx = tile.x + n[i][0];
        const ny = tile.y + n[i][1];
        if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
          neighbors.push(level.tiles[nx][ny]);
        }
      }
      return neighbors;
    }

    function init() {
      images = loadImages([bubbleSpritePath]);
      bubbleimage = images[0];

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mouseup', onMouseUp);

      // Touch events for mobile.
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, { passive: false });

      for (let i = 0; i < level.columns; i++) {
        level.tiles[i] = [];
        for (let j = 0; j < level.rows; j++) {
          level.tiles[i][j] = new Tile(i, j, 0, 0);
        }
      }
      level.width = level.columns * level.tilewidth + level.tilewidth / 2;
      level.height = (level.rows - 1) * level.rowheight + level.tileheight;

      player.x = level.x + level.width / 2 - level.tilewidth / 2;
      player.y = level.y + level.height;
      player.angle = 90;
      player.tiletype = 0;
      player.nextbubble.x = player.x - 2 * level.tilewidth;
      player.nextbubble.y = player.y;

      // Reset persistent bank shot flag for new game.
      player.bubble.bankShot = false;
      newGame();
      main(0);
    }

    function main(tframe) {
      window.requestAnimationFrame(main);
      // Use the ref to check the current time without reinitializing the board.
      if (timeLeftRef.current <= 0 && gamestate !== gamestates.gameover) {
        gamestate = gamestates.gameover;
        setIsWinningModalOpen(true);
        return;
      }
      if (!initialized) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFrame();
        const loadpercentage = loadcount / loadtotal;
        context.strokeStyle = '#fff';
        context.lineWidth = 3;
        context.strokeRect(18.5, canvas.height - 51, canvas.width - 37, 32);
        context.fillStyle = '#991843';
        context.fillRect(22, canvas.height - 47, loadpercentage * (canvas.width * 0.6), 24);
        const loadtext = 'Loading images';
        context.fillStyle = '#D9B14B';
        context.font = '16px Verdana';
        context.fillText(loadtext, 18, canvas.height - 63);
        if (preloaded) {
          setTimeout(() => {
            initialized = true;
          }, 250);
        }
      } else {
        update(tframe);
        render();
      }
    }

    function update(tframe) {
      const dt = (tframe - lastframe) / 1000;
      lastframe = tframe;
      updateFps(dt);
      // Update ball speed based on elapsed time.
      // The ball speed starts at 600 and increases 100 every 24 seconds that pass.
      player.bubble.speed = 600 + 100 * Math.floor((120 - timeLeftRef.current) / 24);

      switch (gamestate) {
        case gamestates.ready:
          break;
        case gamestates.shootbubble:
          stateShootBubble(dt);
          break;
        case gamestates.removecluster:
          stateRemoveCluster(dt);
          break;
        default:
          break;
      }
    }

    function setGameState(newgamestate) {
      gamestate = newgamestate;
      animationstate = 0;
      animationtime = 0;
    }

    // --- Bubble in-flight state ---
    function stateShootBubble(dt) {
      player.bubble.x += dt * player.bubble.speed * Math.cos(degToRad(player.bubble.angle));
      player.bubble.y += dt * player.bubble.speed * -Math.sin(degToRad(player.bubble.angle));

      if (player.bubble.x <= level.x) {
        player.bubble.bankShot = true;
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x;
      } else if (player.bubble.x + level.tilewidth >= level.x + level.width) {
        player.bubble.bankShot = true;
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x + level.width - level.tilewidth;
      }

      if (player.bubble.y <= level.y) {
        player.bubble.y = level.y;
        snapBubble();
        return;
      }

      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          const tile = level.tiles[i][j];
          if (tile.type < 0) continue;
          const coord = getTileCoordinate(i, j);
          if (
            circleIntersection(
              player.bubble.x + level.tilewidth / 2,
              player.bubble.y + level.tileheight / 2,
              level.radius,
              coord.tilex + level.tilewidth / 2,
              coord.tiley + level.tileheight / 2,
              level.radius
            )
          ) {
            snapBubble();
            return;
          }
        }
      }
    }

    // --- Cluster removal state ---
    function stateRemoveCluster(dt) {
      if (animationstate === 0) {
        resetRemoved();
        for (let i = 0; i < cluster.length; i++) {
          cluster[i].removed = true;
        }
        // Calculate score for the main cluster.
        let mainCount = cluster.length;
        floatingclusters = findFloatingClusters();
        let floatingCount = 0;
        if (floatingclusters.length > 0) {
          for (let i = 0; i < floatingclusters.length; i++) {
            floatingCount += floatingclusters[i].length;
          }
        }
        let totalPopped = mainCount + floatingCount;

        let clusterScore = 0;
        for (let i = 0; i < cluster.length; i++) {
          let multiplier = (cluster[i].type !== player.bubble.tiletype) ? NON_MATCH_MULTIPLIER : MATCH_MULTIPLIER;
          if (player.bubble.bankShot) multiplier *= BANK_SHOT_MULTIPLIER;
          clusterScore += BASE_SCORE * multiplier;
        }
        if (totalPopped >= CLUSTER_BONUS_THRESHOLD) {
          clusterScore += CLUSTER_BONUS_SCORE;
        }
        score += clusterScore;
        setScoreState(score);
        // Process floating clusters.
        if (floatingclusters.length > 0) {
          for (let i = 0; i < floatingclusters.length; i++) {
            for (let j = 0; j < floatingclusters[i].length; j++) {
              const tile = floatingclusters[i][j];
              tile.shift = 1;
              tile.velocity = player.bubble.dropspeed;
              let multiplier = (tile.type !== player.bubble.tiletype) ? NON_MATCH_MULTIPLIER : MATCH_MULTIPLIER;
              if (player.bubble.bankShot) multiplier *= BANK_SHOT_MULTIPLIER;
              score += BASE_SCORE * multiplier;
              setScoreState(score);
            }
          }
        }
        animationstate = 1;
      }
      if (animationstate === 1) {
        let tilesleft = false;
        for (let i = 0; i < cluster.length; i++) {
          const tile = cluster[i];
          if (tile.type >= 0) {
            tilesleft = true;
            tile.alpha -= dt * 15;
            if (tile.alpha < 0) tile.alpha = 0;
            if (tile.alpha === 0) {
              tile.type = -1;
              tile.alpha = 1;
            }
          }
        }
        for (let i = 0; i < floatingclusters.length; i++) {
          for (let j = 0; j < floatingclusters[i].length; j++) {
            const tile = floatingclusters[i][j];
            if (tile.type >= 0) {
              tilesleft = true;
              tile.velocity += dt * 700;
              tile.shift += dt * tile.velocity;
              tile.alpha -= dt * 8;
              if (tile.alpha < 0) tile.alpha = 0;
              if (
                tile.alpha === 0 ||
                tile.y * level.rowheight + tile.shift >
                  (level.rows - 1) * level.rowheight + level.tileheight
              ) {
                tile.type = -1;
                tile.shift = 0;
                tile.alpha = 1;
              }
            }
          }
        }
        if (!tilesleft) {
          // Increment move counter and update state.
          turncounter++;
          setCounter(turncounter);
          processThreshold();
          if (countBubbles() < MIN_BUBBLE_COUNT) {
            addBubbles();
          }
          nextBubble();
          setGameState(gamestates.ready);
        }
      }
    }

    // --- Revised snapBubble() function ---
    function snapBubble() {
      const centerx = player.bubble.x + level.tilewidth / 2;
      const centery = player.bubble.y + level.tileheight / 2;
      let gridpos = getGridPosition(centerx, centery);

      if (gridpos.x < 0) gridpos.x = 0;
      if (gridpos.x >= level.columns) gridpos.x = level.columns - 1;
      if (gridpos.y < 0) gridpos.y = 0;
      if (gridpos.y >= level.rows) gridpos.y = level.rows - 1;

      let addtile = false;
      if (level.tiles[gridpos.x][gridpos.y].type !== -1) {
        for (let newrow = gridpos.y + 1; newrow < level.rows; newrow++) {
          if (level.tiles[gridpos.x][newrow].type === -1) {
            gridpos.y = newrow;
            addtile = true;
            break;
          }
        }
      } else {
        addtile = true;
      }

      if (addtile) {
        player.bubble.visible = false;
        level.tiles[gridpos.x][gridpos.y].type = player.bubble.tiletype;
        if (checkGameOver()) return;
        cluster = findCluster(gridpos.x, gridpos.y, true, true, false);
      }

      if (cluster.length >= 3) {
        setGameState(gamestates.removecluster);
        return;
      }
      
      turncounter++;
      setCounter(turncounter);
      processThreshold();
      if (countBubbles() < MIN_BUBBLE_COUNT) {
        addBubbles();
      }
      nextBubble();
      setGameState(gamestates.ready);
    }

    // --- Process move threshold ---
    function processThreshold() {
      if (turncounter >= currentThresholdRef.current) {
        addBubbles();
        turncounter = 0;
        setCounter(turncounter);
        if (currentThresholdRef.current > MINTHRESHOLD) {
          currentThresholdRef.current = currentThresholdRef.current - THRESHOLDCHANGE;
          if (currentThresholdRef.current < MINTHRESHOLD) {
            currentThresholdRef.current = MINTHRESHOLD
          }
        }
        setThresholdState(currentThresholdRef.current);
        if (checkGameOver()) return;
      }
    }

    function checkGameOver() {
      for (let i = 0; i < level.columns; i++) {
        if (level.tiles[i][level.rows - 1].type !== -1) {
          nextBubble();
          setGameState(gamestates.gameover);
          setIsWinningModalOpen(true);
          return true;
        }
      }
      return false;
    }

    function addBubbles() {
      for (let i = 0; i < level.columns; i++) {
        for (let j = level.rows - 1; j > 0; j--) {
          level.tiles[i][j].type = level.tiles[i][j - 1].type;
        }
      }
      for (let i = 0; i < level.columns; i++) {
        level.tiles[i][0].type = randRange(0, bubblecolors - 1);
      }
      const newRowOffset = 1 - rowOffsets[0];
      rowOffsets.unshift(newRowOffset);
      rowOffsets.pop();
    }

    function countBubbles() {
      let count = 0;
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          if (level.tiles[i][j].type !== -1) count++;
        }
      }
      return count;
    }

    function findColors() {
      const foundcolors = [];
      const colortable = [];
      for (let i = 0; i < bubblecolors; i++) colortable.push(false);
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          const tile = level.tiles[i][j];
          if (tile.type >= 0 && !colortable[tile.type]) {
            colortable[tile.type] = true;
            foundcolors.push(tile.type);
          }
        }
      }
      return foundcolors;
    }

    function findCluster(tx, ty, matchtype, reset, skipremoved) {
      if (reset) resetProcessed();
      const targettile = level.tiles[tx][ty];
      const toprocess = [targettile];
      targettile.processed = true;
      const foundcluster = [];
      while (toprocess.length > 0) {
        const currenttile = toprocess.pop();
        if (currenttile.type === -1) continue;
        if (skipremoved && currenttile.removed) continue;
        if (!matchtype || currenttile.type === targettile.type) {
          foundcluster.push(currenttile);
          const neighbors = getNeighbors(currenttile);
          for (let i = 0; i < neighbors.length; i++) {
            if (!neighbors[i].processed) {
              toprocess.push(neighbors[i]);
              neighbors[i].processed = true;
            }
          }
        }
      }
      return foundcluster;
    }

    function findFloatingClusters() {
      resetProcessed();
      const foundclusters = [];
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          const tile = level.tiles[i][j];
          if (!tile.processed) {
            const foundcluster = findCluster(i, j, false, false, true);
            if (foundcluster.length <= 0) continue;
            let floating = true;
            for (let k = 0; k < foundcluster.length; k++) {
              if (foundcluster[k].y === 0) {
                floating = false;
                break;
              }
            }
            if (floating) foundclusters.push(foundcluster);
          }
        }
      }
      return foundclusters;
    }

    function resetProcessed() {
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          level.tiles[i][j].processed = false;
        }
      }
    }

    function resetRemoved() {
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          level.tiles[i][j].removed = false;
        }
      }
    }

    function updateFps(dt) {
      if (fpstime > 0.25) {
        fps = Math.round(framecount / fpstime);
        fpstime = 0;
        framecount = 0;
        setFpsState(fps);
      }
      fpstime += dt;
      framecount++;
    }

    function drawFrame() {
      context.fillStyle = '#8F8389';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function render() {
      drawFrame();
      const yoffset = level.tileheight / 2;
      context.fillStyle = '';
      context.fillRect(level.x - 4, level.y - 4, level.width + 8, level.height + 4 - yoffset);
      renderTiles();
      context.fillStyle = '#991843';
      context.fillRect(
        level.x - 4,
        level.y - 4 + level.height + 4 - yoffset,
        level.width + 8,
        2 * level.tileheight + 3
      );
      renderPlayer();
    }

    function renderTiles() {
      for (let j = 0; j < level.rows; j++) {
        for (let i = 0; i < level.columns; i++) {
          const tile = level.tiles[i][j];
          const shift = tile.shift;
          const coord = getTileCoordinate(i, j);
          if (tile.type >= 0) {
            context.save();
            context.globalAlpha = tile.alpha;
            drawBubble(coord.tilex, coord.tiley + shift, tile.type);
            context.restore();
          }
        }
      }
    }

    // --- Render shooter and next bubble preview ---
    function renderPlayer() {
      const centerx = player.x + level.tilewidth / 2;
      const centery = player.y + level.tileheight / 2;
      
      // Draw shooter base.
      context.fillStyle = '#7a7a7a';
      context.beginPath();
      context.arc(centerx, centery, level.radius + 12, 0, 2 * Math.PI, false);
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = '#8c8c8c';
      context.stroke();

      // Aim indicator: draw 3 circles along the aim vector.
      const aimLengthX = 1.5 * level.tilewidth * Math.cos(degToRad(player.angle));
      const aimLengthY = -1.5 * level.tileheight * Math.sin(degToRad(player.angle));
      const aimPos1 = { x: centerx + aimLengthX * 0.45, y: centery + aimLengthY * 0.45 };
      const aimPos2 = { x: centerx + aimLengthX * 0.7, y: centery + aimLengthY * 0.7 };
      const aimPos3 = { x: centerx + aimLengthX * 1.025, y: centery + aimLengthY * 1.025 };
      const aimRadii = [4, 6, 8];
      for (let i = 0; i < 3; i++) {
        context.beginPath();
        const pos = i === 0 ? aimPos1 : i === 1 ? aimPos2 : aimPos3;
        context.arc(pos.x, pos.y, aimRadii[i], 0, 2 * Math.PI);
        context.fillStyle = '#D9B14B';
        context.fill();
        context.lineWidth = 0.75;
        context.strokeStyle = 'black';
        context.stroke();
      }
      // End aim indicator.

      // Next bubble preview: draw a smaller dark circle behind the preview.
      context.save();
      const previewX = player.nextbubble.x + level.tilewidth / 2;
      const previewY = player.nextbubble.y + level.tileheight / 2;
      context.fillStyle = '#333';
      context.beginPath();
      context.arc(previewX, previewY, level.radius, 0, 2 * Math.PI, false);
      context.fill();
      context.restore();

      drawBubble(player.nextbubble.x, player.nextbubble.y, player.nextbubble.tiletype);
      if (player.bubble.visible) {
        drawBubble(player.bubble.x, player.bubble.y, player.bubble.tiletype);
      }
    }

    function getGridPosition(x, y) {
      const gridy = Math.floor((y - level.y) / level.rowheight);
      let xoffset = 0;
      if (rowOffsets[gridy] === 1) {
        xoffset = level.tilewidth / 2;
      }
      const gridx = Math.floor((x - xoffset - level.x) / level.tilewidth);
      return { x: gridx, y: gridy };
    }

    // --- Updated drawBubble() function ---
    function drawBubble(x, y, index) {
      if (index < 0 || index >= bubblecolors) return;
      context.drawImage(
        bubbleimage,
        index * 40,
        0,
        40,
        40,
        x,
        y,
        level.tilewidth,
        level.tileheight
      );
      context.beginPath();
      context.arc(x + level.tilewidth / 2, y + level.tileheight / 2, level.radius - 0.5, 0, 2 * Math.PI);
      context.lineWidth = 1;
      context.strokeStyle = borderColors[index];
      context.stroke();
    }

    // --- Game reset and new game functions ---
    function newGame() {
      score = 0;
      setScoreState(0);
      turncounter = 0;
      setCounter(0);
      setThresholdState(INITIAL_THRESHOLD);
      currentThresholdRef.current = INITIAL_THRESHOLD;
      // Reset gameStarted so the clock won't run until the first bubble is shot.
      setGameStarted(false);
      setGameState(gamestates.ready);
      createLevel();
      nextBubble();
      nextBubble();
      setIsWinningModalOpen(false);
    }
    newGameRef.current = newGame;

    function createLevel() {
      for (let j = 0; j < level.rows; j++) {
        let randomtile = randRange(0, bubblecolors - 1);
        let count = 0;
        for (let i = 0; i < level.columns; i++) {
          if (count >= 2) {
            let newtile = randRange(0, bubblecolors - 1);
            if (newtile === randomtile) {
              newtile = (newtile + 1) % bubblecolors;
            }
            randomtile = newtile;
            count = 0;
          }
          count++;
          if (j < level.rows / 2) {
            level.tiles[i][j].type = randomtile;
          } else {
            level.tiles[i][j].type = -1;
          }
        }
      }
    }

    function nextBubble() {
      // Reset persistent bank shot flag for new shot.
      player.bubble.bankShot = false;
      player.tiletype = player.nextbubble.tiletype;
      player.bubble.tiletype = player.nextbubble.tiletype;
      player.bubble.x = player.x;
      player.bubble.y = player.y;
      player.bubble.visible = true;
      const nextcolor = getExistingColor();
      player.nextbubble.tiletype = nextcolor;
    }

    function getExistingColor() {
      const existingcolors = findColors();
      let bubbletype = 0;
      if (existingcolors.length > 0) {
        bubbletype = existingcolors[randRange(0, existingcolors.length - 1)];
      }
      return bubbletype;
    }

    function randRange(low, high) {
      return Math.floor(low + Math.random() * (high - low + 1));
    }

    // --- Modified shootBubble() ---
    // The first time a bubble is shot, we set gameStarted to true.
    function shootBubble() {
      setGameStarted(prev => (prev ? prev : true));
      player.bubble.x = player.x;
      player.bubble.y = player.y;
      player.bubble.angle = player.angle;
      player.bubble.tiletype = player.tiletype;
      setGameState(gamestates.shootbubble);
    }

    function circleIntersection(x1, y1, r1, x2, y2, r2) {
      const dx = x1 - x2;
      const dy = y1 - y2;
      const len = Math.sqrt(dx * dx + dy * dy);
      return len < r1 + r2;
    }

    function radToDeg(angle) {
      return angle * (180 / Math.PI);
    }

    function degToRad(angle) {
      return angle * (Math.PI / 180);
    }

    // --- Input handlers for desktop and mobile ---

    function onMouseMove(e) {
      const pos = getMousePos(canvas, e);
      updateAim(pos);
    }

    function onMouseDown(e) {
      isAiming = true;
      const pos = getMousePos(canvas, e);
      updateAim(pos);
    }

    function onMouseUp(e) {
      if (isAiming && gamestate === gamestates.ready) {
        shootBubble();
      }
      isAiming = false;
    }

    function onTouchStart(e) {
      e.preventDefault();
      isAiming = true;
      const pos = getTouchPos(canvas, e);
      updateAim(pos);
    }

    function onTouchMove(e) {
      e.preventDefault();
      const pos = getTouchPos(canvas, e);
      updateAim(pos);
    }

    function onTouchEnd(e) {
      e.preventDefault();
      if (isAiming && gamestate === gamestates.ready) {
        shootBubble();
      }
      isAiming = false;
    }

    function updateAim(pos) {
      let mouseangle = radToDeg(
        Math.atan2(
          player.y + level.tileheight / 2 - pos.y,
          pos.x - (player.x + level.tilewidth / 2)
        )
      );
      if (mouseangle < 0) {
        mouseangle = 180 + (180 + mouseangle);
      }
      const lbound = 8;
      const ubound = 172;
      if (mouseangle > 90 && mouseangle < 270) {
        if (mouseangle > ubound) mouseangle = ubound;
      } else {
        if (mouseangle < lbound || mouseangle >= 270) mouseangle = lbound;
      }
      player.angle = mouseangle;
    }

    function getMousePos(canvas, e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.round(((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
        y: Math.round(((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height),
      };
    }

    function getTouchPos(canvas, e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: Math.round(((touch.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
        y: Math.round(((touch.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height),
      };
    }

    function onMouseLeave() {
      isAiming = false;
    }

    init();

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [setIsWinningModalOpen]);

  // Format the time as M:SS.
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main>
      <Header
        title="Bubble Blitz"
        onclick={resetGame}
        turn_title="Score"
        turns={scoreState}
        howTo={`Take aim by clicking on the board to direct the aiming circles. Release to fire the bubble along that path.\n
            Score points by popping 3 or more bubbles that match the shot bubble. \n
            Each bubble is worth ${BASE_SCORE} points.\n
            Play quickly! As the clock winds down the bubbles regenerate faster. \n
            The game ends when the clock runs out or if a bubble crosses the bottom edge of the board.\n
            -- BONUS POINTS -- Extra bubbles that do not match the shot bubble color are worth ${NON_MATCH_MULTIPLIER}x.\n
            A bonus of ${CLUSTER_BONUS_SCORE} is awarded when clusters of ${CLUSTER_BONUS_THRESHOLD} or more are popped.\n
            Bank shots—bouncing off a wall—add an extra ${(BANK_SHOT_MULTIPLIER * 100) - 100}% to popped bubbles.\n
            Current threshold: ${thresholdState} moves`}
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />
      {/* Clock display */}
      <div style={{ textAlign: 'center', fontSize: '24px', margin: '10px' }}>
        {formatTime(timeLeft)}
        {/* Below is for diagnostics only */}
        {/* {formatTime(timeLeft)} -- threshold: {thresholdState} moves -- moves: {counter} */}
      </div>
      <canvas
        ref={canvasRef}
        width="343"
        height="435"
        style={{ border: '4px solid #D9B14B', borderRadius: '6px' }}
      />
      {isWinningModalOpen && (
        <WinningModal
          message1="GAME OVER - "
          message2="points!"
          turns={scoreState}
          onClose={resetGame}
        />
      )}
    </main>
  );
}
