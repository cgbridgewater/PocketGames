// IMPORT REACT MAGIC
import React, { useRef, useEffect, useState } from 'react';

// IMPORT SUBCOMPONENTS
import Header from '../components/GameHeader/GameHeader';
import WinningModal from '../components/Modals/WinningModal';

// IMPORT IMAGES
import bubbleSpritePath from '../assets/images/bubble-sprites.png';

export default function BubbleShooter({
  isWinningModalOpen,
  setIsWinningModalOpen,
  isTimerPaused,
  setIsTimerPaused,
}) {
  const canvasRef = useRef(null);
  // We'll store the current score so we can display it in Header/Modal.
  const [scoreState, setScoreState] = useState(0);
  const [fpsState, setFpsState] = useState(0);

  // We'll store a ref to the newGame() function so Header/Modal can call it.
  const newGameRef = useRef(null);

  useEffect(() => {
    // ------------------------------
    // Original game code starts here
    // ------------------------------

    // Get the canvas and context from the ref
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Timing and frames per second
    let lastframe = 0;
    let fpstime = 0;
    let framecount = 0;
    let fps = 0;
    
    let initialized = false;
    
    // Level
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
      tiles: []       
    };

    // Define a tile class
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

    // Player
    const player = {
      x: 0,
      y: 0,
      angle: 0,
      tiletype: 0,
      bubble: {
        x: 0,
        y: 0,
        angle: 0,
        speed: 1000,
        dropspeed: 900,
        tiletype: 0,
        visible: false,
      },
      nextbubble: {
        x: 0,
        y: 0,
        tiletype: 0,
      },
    };

    // Neighbor offset table
    const neighborsoffsets = [
      [
        [1, 0],
        [0, 1],
        [-1, 1],
        [-1, 0],
        [-1, -1],
        [0, -1],
      ], // Even row tiles
      [
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 0],
        [0, -1],
        [1, -1],
      ], // Odd row tiles
    ];
    
    // Number of different colors
    const bubblecolors = 7;
    
    // Game states
    const gamestates = { init: 0, ready: 1, shootbubble: 2, removecluster: 3, gameover: 4 };
    let gamestate = gamestates.init;
    
    // Score (this is our internal mutable variable; we mirror it into scoreState via setScoreState)
    let score = 0;
    
    let turncounter = 0;
    let rowoffset = 0;
    
    // Animation variables
    let animationstate = 0;
    let animationtime = 0;
    
    // Clusters
    let showcluster = false;
    let cluster = [];
    let floatingclusters = [];
    
    // Images
    let images = [];
    let bubbleimage;
    
    // Image loading globals
    let loadcount = 0;
    let loadtotal = 0;
    let preloaded = false;

    // ----------------------------------
    // Original methods from the JS file
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

    function init() {
      // Load images
      images = loadImages([bubbleSpritePath]);
      bubbleimage = images[0];

      // Add mouse events
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mousedown', onMouseDown);

      // Initialize the two-dimensional tile array
      for (let i = 0; i < level.columns; i++) {
        level.tiles[i] = [];
        for (let j = 0; j < level.rows; j++) {
          level.tiles[i][j] = new Tile(i, j, 0, 0);
        }
      }

      level.width = level.columns * level.tilewidth + level.tilewidth / 2;
      level.height = (level.rows - 1) * level.rowheight + level.tileheight;

      // Init the player
      player.x = level.x + level.width / 2 - level.tilewidth / 2;
      player.y = level.y + level.height;
      player.angle = 90;
      player.tiletype = 0;
      player.nextbubble.x = player.x - 2 * level.tilewidth;
      player.nextbubble.y = player.y;

      // New game (resets score, tiles, etc.)
      newGame();

      // Enter main loop
      main(0);
    }

    function main(tframe) {
      window.requestAnimationFrame(main);

      if (!initialized) {
        // Preloader
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFrame();

        // Draw a progress bar
        const loadpercentage = loadcount / loadtotal;
        context.strokeStyle = '#fff';
        context.lineWidth = 3;
        context.strokeRect(18.5, canvas.height - 51, canvas.width - 37, 32);
        context.fillStyle = '#991843';
        context.fillRect(
          22,
          canvas.height - 47,
          loadpercentage * (canvas.width * .6),
          24
        );

        // Draw the progress text
        // const loadtext = 'Loaded ' + loadcount + '/' + loadtotal + ' images';
        const loadtext = 'Loading images';
        context.fillStyle = '#D9B14B';
        context.font = '16px Verdana';
        context.fillText(loadtext, 18, canvas.height - 63);

        if (preloaded) {
          // Add a small delay for demonstration
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

      // Update the fps counter
      updateFps(dt);

      switch (gamestate) {
        case gamestates.ready:
          // Waiting for input.
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

    function stateShootBubble(dt) {
      // Move bubble
      player.bubble.x += dt * player.bubble.speed * Math.cos(degToRad(player.bubble.angle));
      player.bubble.y += dt * player.bubble.speed * -Math.sin(degToRad(player.bubble.angle));

      // Collide with left/right boundaries
      if (player.bubble.x <= level.x) {
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x;
      } else if (player.bubble.x + level.tilewidth >= level.x + level.width) {
        player.bubble.angle = 180 - player.bubble.angle;
        player.bubble.x = level.x + level.width - level.tilewidth;
      }

      // Collide with the top
      if (player.bubble.y <= level.y) {
        player.bubble.y = level.y;
        snapBubble();
        return;
      }

      // Collide with other tiles
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

    function stateRemoveCluster(dt) {
      if (animationstate === 0) {
        resetRemoved();
        for (let i = 0; i < cluster.length; i++) {
          cluster[i].removed = true;
        }
        // Increase score for removed cluster
        score += cluster.length * 100;
        setScoreState(score);
        floatingclusters = findFloatingClusters();
        if (floatingclusters.length > 0) {
          for (let i = 0; i < floatingclusters.length; i++) {
            for (let j = 0; j < floatingclusters[i].length; j++) {
              const tile = floatingclusters[i][j];
              tile.shift = 1;
              tile.velocity = player.bubble.dropspeed;
              score += 100;
              setScoreState(score);
            }
          }
        }
        animationstate = 1;
      }

      if (animationstate === 1) {
        let tilesleft = false;
        // Animate popping bubbles
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
        // Animate dropping floating clusters
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
          nextBubble();
          // Check for game over (or win) condition
          let tilefound = false;
          for (let i = 0; i < level.columns; i++) {
            for (let j = 0; j < level.rows; j++) {
              if (level.tiles[i][j].type !== -1) {
                tilefound = true;
                break;
              }
            }
          }
          if (tilefound) {
            setGameState(gamestates.ready);
          } else {
            // Instead of drawing a game over overlay, we open our WinningModal.
            setGameState(gamestates.gameover);
            setIsWinningModalOpen(true);
          }
        }
      }
    }

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
        if (cluster.length >= 3) {
          setGameState(gamestates.removecluster);
          return;
        }
      }

      turncounter++;
      if (turncounter >= 5) {
        addBubbles();
        turncounter = 0;
        rowoffset = (rowoffset + 1) % 2;
        if (checkGameOver()) return;
      }

      nextBubble();
      setGameState(gamestates.ready);
    }

    function checkGameOver() {
      for (let i = 0; i < level.columns; i++) {
        if (level.tiles[i][level.rows - 1].type !== -1) {
          nextBubble();
          setGameState(gamestates.gameover);
          // Trigger modal open for game over.
          setIsWinningModalOpen(true);
          return true;
        }
      }
      return false;
    }

    function addBubbles() {
      // Move rows down
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows - 1; j++) {
          level.tiles[i][level.rows - 1 - j].type =
            level.tiles[i][level.rows - 1 - j - 1].type;
        }
      }
      // New row at the top
      for (let i = 0; i < level.columns; i++) {
        level.tiles[i][0].type = getExistingColor();
      }
    }

    function findColors() {
      const foundcolors = [];
      const colortable = [];
      for (let i = 0; i < bubblecolors; i++) {
        colortable.push(false);
      }
      for (let i = 0; i < level.columns; i++) {
        for (let j = 0; j < level.rows; j++) {
          const tile = level.tiles[i][j];
          if (tile.type >= 0) {
            if (!colortable[tile.type]) {
              colortable[tile.type] = true;
              foundcolors.push(tile.type);
            }
          }
        }
      }
      return foundcolors;
    }

    function findCluster(tx, ty, matchtype, reset, skipremoved) {
      if (reset) {
        resetProcessed();
      }
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
            if (floating) {
              foundclusters.push(foundcluster);
            }
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

    function getNeighbors(tile) {
      const tilerow = (tile.y + rowoffset) % 2;
      const neighbors = [];
      const n = neighborsoffsets[tilerow];
      for (let i = 0; i < n.length; i++) {
        const nx = tile.x + n[i][0];
        const ny = tile.y + n[i][1];
        if (nx >= 0 && nx < level.columns && ny >= 0 && ny < level.rows) {
          neighbors.push(level.tiles[nx][ny]);
        }
      }
      return neighbors;
    }

    function updateFps(dt) {
      if (fpstime > 0.25) {
        fps = Math.round(framecount / fpstime);
        fpstime = 0;
        framecount = 0;
      }
      fpstime += dt;
      framecount++;
    }

    // function drawCenterText(text, x, y, width) {
    //   const textdim = context.measureText(text);
    //   context.fillText(text, x + (width - textdim.width) / 2, y);
    // }

    function render() {
      drawFrame();
      const yoffset = level.tileheight / 2;

      // Level background
      context.fillStyle = '#000';
      context.fillRect(level.x - 4, level.y - 4, level.width + 8, level.height + 4 - yoffset);

      // Render tiles
      renderTiles();

      // Bottom area
      context.fillStyle = '#991843';
      context.fillRect(level.x - 4, level.y - 4 + level.height + 4 - yoffset, level.width + 8, 2 * level.tileheight + 3);

      // Score
    //   context.fillStyle = '#ffffff';
    //   context.font = '18px Verdana';
    //   const scorex = level.x + level.width - 150;
    //   const scorey = level.y + level.height + level.tileheight - yoffset - 8;
    //   drawCenterText('Score:', scorex, scorey, 150);
    //   context.font = '24px Verdana';
    //   drawCenterText(score, scorex, scorey + 30, 150);

      // (Omit drawing the in-canvas game over message since WinningModal is used.)

      // Render player bubble
      renderPlayer();
    }

    function drawFrame() {
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);

    //   context.fillStyle = '#000';
    //   context.font = '0.85rem Verdana';
    //   context.fillText('Fps: ' + fps, 5, 15);
    //   setFpsState(fps);
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

    function renderPlayer() {
      const centerx = player.x + level.tilewidth / 2;
      const centery = player.y + level.tileheight / 2;

      // Player background circle
      context.fillStyle = '#7a7a7a';
      context.beginPath();
      context.arc(centerx, centery, level.radius + 12, 0, 2 * Math.PI, false);
      context.fill();
      context.lineWidth = 2;
      context.strokeStyle = '#8c8c8c';
      context.stroke();

      // Angle line
      context.lineWidth = 3;
      context.strokeStyle = '#fff';
      context.beginPath();
      context.moveTo(centerx, centery);
      context.lineTo(
        centerx + 1.5 * level.tilewidth * Math.cos(degToRad(player.angle)),
        centery - 1.5 * level.tileheight * Math.sin(degToRad(player.angle))
      );
      context.stroke();

      // Next bubble
      drawBubble(player.nextbubble.x, player.nextbubble.y, player.nextbubble.tiletype);

      // Current bubble
      if (player.bubble.visible) {
        drawBubble(player.bubble.x, player.bubble.y, player.bubble.tiletype);
      }
    }

    function getTileCoordinate(column, row) {
      let tilex = level.x + column * level.tilewidth;
      if ((row + rowoffset) % 2) {
        tilex += level.tilewidth / 2;
      }
      const tiley = level.y + row * level.rowheight;
      return { tilex, tiley };
    }

    function getGridPosition(x, y) {
      const gridy = Math.floor((y - level.y) / level.rowheight);
      let xoffset = 0;
      if ((gridy + rowoffset) % 2) {
        xoffset = level.tilewidth / 2;
      }
      const gridx = Math.floor((x - xoffset - level.x) / level.tilewidth);
      return { x: gridx, y: gridy };
    }

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
    }

    function newGame() {
      // Reset game state variables and score.
      score = 0;
      setScoreState(0);
      turncounter = 0;
      rowoffset = 0;
      setGameState(gamestates.ready);
      createLevel();
      nextBubble();
      nextBubble();
    }

    // Expose newGame so that Header/Modal can call it.
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

    function shootBubble() {
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

    function onMouseMove(e) {
      const pos = getMousePos(canvas, e);
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
        if (mouseangle > ubound) {
          mouseangle = ubound;
        }
      } else {
        if (mouseangle < lbound || mouseangle >= 270) {
          mouseangle = lbound;
        }
      }
      player.angle = mouseangle;
    }

    function onMouseDown() {
      if (gamestate === gamestates.ready) {
        shootBubble();
      } else if (gamestate === gamestates.gameover) {
        newGame();
        setIsWinningModalOpen(false);
      }
    }

    function getMousePos(canvas, e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: Math.round(((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width),
        y: Math.round(((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height),
      };
    }

    // Start the game
    init();

    // ------------------------------
    // Original game code ends here
    // ------------------------------

    // Cleanup on unmount
    return () => {
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
    };
  }, [setIsWinningModalOpen]);

  return (
    <main>
      {/* GAME HEADER */}
      <Header
        title="Bubble Mania"
        onClick={() => {
          if (newGameRef.current) {
            newGameRef.current();
          }
          setIsWinningModalOpen(false);
        }}
        turn_title="Score"
        turns={scoreState}
        howTo="This will contain gameplay text later"
        isTimerPaused={isTimerPaused}
        setIsTimerPaused={setIsTimerPaused}
      />
      {/* GAME PLAY */}
      <p style={{width: "345px", textAlign: "end"}}>FPS: { fpsState }</p>
      <canvas
        ref={canvasRef}
        width="343"
        height="435"
        style={{ border: '4px solid #D9B14B', borderRadius: "6px" }}
      />
      {/* MODAL POPUP */}
      {isWinningModalOpen && (
        <WinningModal
          message1="GAME OVER - "
          message2="points!"
          turns={scoreState}
          onClose={() => {
            if (newGameRef.current) {
              newGameRef.current();
            }
            setIsWinningModalOpen(false);
          }}
        />
      )}
    </main>
  );
}
