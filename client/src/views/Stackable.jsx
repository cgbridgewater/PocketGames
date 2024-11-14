import React, { useEffect, useRef, useState } from "react";
import WinningModal from "../components/Modals/WinningModal";
import Header from "../components/GameHeader/GameHeader";

const Stackable = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
    const [moves, setMoves] = useState(1); // Initialize with 1 for the first box
    const [isSmallScreen, setIsSmallScreen] = useState(true);
    const canvasRef = useRef(null);


    useEffect(() => {
        // Function to check screen size
        const checkScreenSize = () => {
            if (window.innerWidth <= 850) {
                setIsSmallScreen(true);
            } else {
                setIsSmallScreen(false);
            }
        };
        // Check screen size on initial load
        checkScreenSize();
        // Add resize event listener to handle window resizing
        window.addEventListener('resize', checkScreenSize);
        // Cleanup function to remove the event listener
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // Effect to call handleRestartPush whenever isSmallScreen changes
    useEffect(() => {
        // Trigger handleRestartPush when the screen size changes
        handleRestartPush();
    }, [isSmallScreen]);

    // Canvas Variables
    let scrollCounter, cameraY, current, mode ;
    // Bounce speed variable
    let xSpeed = 1
    // Speed of the boxes falling
    let ySpeed = 5;
     // Speed of the boxes falling
    let height = 50;
    // Array to hold the boxes
    let boxes = [];
    // Debris state for the parts that break off from the box
    let debris = { x: 0, width: 0 }; 

    // Function to handle the game over state
    const gameOver = (context) => {
        mode = 'gameOver';
        context.fillText('Game over. Click to play again!', 50, 50);
        // Trigger the winning modal
        setIsWinningModalOpen(true);
    };

    // Function to create a new box with randomized color
    const newBox = () => {
        const randomColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;  // Generate a random color
        boxes[current] = {
            x: 0,
            y: (current + 10) * 50,
            width: boxes[current - 1].width,
            color: randomColor
        };
    };

    // Animation loop for the game
    const animate = (context) => {
        if (mode !== 'gameOver') {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            // Draw each box on the canvas with the assigned color
            for (let n = 0; n < boxes.length; n++) {
                let box = boxes[n];
                context.fillStyle = box.color;
                context.fillRect(box.x, 600 - box.y + cameraY, box.width, height);
            }
            // Draw the debris with a fixed color
            context.fillStyle = '#C23866';
            context.fillRect(debris.x, 600 - debris.y + cameraY, debris.width, height);
            // Handle the bouncing mode
            if (mode === 'bounce') {
                boxes[current].x += xSpeed;
                if (xSpeed > 0 && boxes[current].x + boxes[current].width > context.canvas.width)
                    xSpeed = -xSpeed;
                if (xSpeed < 0 && boxes[current].x < 0)
                    xSpeed = -xSpeed;
            }
            // Handle the falling mode
            if (mode === 'fall') {
                boxes[current].y -= ySpeed;
                if (boxes[current].y === boxes[current - 1].y + height) {
                    mode = 'bounce';
                    let difference = boxes[current].x - boxes[current - 1].x;
                    if (Math.abs(difference) >= boxes[current].width) {
                        gameOver(context);
                    }
                    debris = {
                        y: boxes[current].y,
                        width: difference
                    };
                    if (boxes[current].x > boxes[current - 1].x) {
                        boxes[current].width -= difference;
                        debris.x = boxes[current].x + boxes[current].width;
                    } else {
                        debris.x = boxes[current].x - difference;
                        boxes[current].width += difference;
                        boxes[current].x = boxes[current - 1].x;
                    }
                    // Increase speed when bouncing, this should be reset on restart
                    xSpeed += xSpeed > 0 ? 1 : -1;
                    current++;
                    scrollCounter = height;
                    if (mode !== 'gameOver') {
                        setMoves(prevMoves => prevMoves + 1);
                    }
                    newBox();
                }
            }
            debris.y -= ySpeed;
            if (scrollCounter) {
                cameraY++;
                scrollCounter--;
            }
        }
        window.requestAnimationFrame(() => animate(context));
    };

    // Restart function to reset all necessary states
    // Delay the restart by 100 milliseconds to allow for proper reset
    const restart = (context) => {
        // Reset game state and variables
        boxes = []; // Clear the boxes array
        setMoves(1); // Reset moves state to 0 when restarting
        setTimeout(() => {
            // Reinitialize the first box
            const setX = isSmallScreen ? 85 : 300
            const setY = isSmallScreen ? 290 : 300
            const setWidth = isSmallScreen ? 180 : 200
            boxes[0] = {
                x:setX,
                y: setY,
                width: setWidth
            }; 
            mode = 'bounce';
            cameraY = 0;
            scrollCounter = 0;
            xSpeed = 1;
            current = 1;
            debris = { x: 0, width: 0 };
            setIsWinningModalOpen(false);
            newBox();
            // Clear the canvas after the delay
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            // Start animation loop
            animate(context); // Start the animation loop after the reset
        }, 50); // 100ms delay to allow for state updates
    };

    // Handle the button click to restart the game
    const handleRestartPush = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.onpointerdown = function () {
            if (mode === 'gameOver')
                // Call restart when game over
                restart(context);
            else {
            // Switch to falling mode when clicked
                if (mode === 'bounce') mode = 'fall';
            }
        };
        restart(context);
        animate(context);
    }

    // useEffect hook to start the game when the component mounts
    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.onpointerdown = function () {
            if (mode === 'gameOver')
                restart(context);
            else {
                if (mode === 'bounce') mode = 'fall';
            }
        };
        // Initialize game state when the component is mounted
        restart(context); 
        // Reset moves state to 0 when restarting
        setMoves(0);
    }, []);

    return (
        <main>
            {/* HEADER COMPONENT */}
            <Header
                title={"Stackable"}
                onclick={handleRestartPush}
                turn_title={"Level"}
                turns={moves}
            />
            {gameOver? 
                <canvas
                    ref={canvasRef}
                    width={isSmallScreen ? 360 : 780}
                    height={isSmallScreen ? 450 : 550}
                    style={{ border: '1px solid #D9B14B', borderRadius: "8px" }}
                /> 
                : 
                ""
                }
            {/* MODAL POPUP */}
            {isWinningModalOpen && (
                <WinningModal
                    message1="You made it to level"
                    turns={moves}
                    message2="!"
                    onClose={handleRestartPush}
                />
            )}
        </main>
    );
};

export default Stackable;
