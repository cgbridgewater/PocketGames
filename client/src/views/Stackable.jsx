import React, { useEffect, useRef, useState } from "react";
import WinningModal from "../components/Modals/WinningModal";
import Header from "../components/GameHeader/GameHeader";

const Stackable = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
    const [moves, setMoves] = useState(1); // Initialize with 1 for the first box

    const canvasRef = useRef(null);

    // Non-React variables
    let scrollCounter, cameraY, current, mode ;
    let xSpeed = 2
    let ySpeed = 5; // Speed of the boxes falling
    let height = 50; // Height of each box
    let boxes = []; // Array to hold the boxes
    let debris = { x: 0, width: 0 }; // Debris state for the parts that break off from the box

    // Function to create a new box
    const newBox = () => {
        boxes[current] = {
            x: 0,
            y: (current + 10) * height,
            width: boxes[current - 1].width
        };
        // Increment moves when a new box is created
        setMoves(prevMoves => prevMoves + 1);
    };

    // Function to handle the game over state
    const gameOver = (context) => {
        mode = 'gameOver';
        context.fillText('Game over. Click to play again!', 50, 50);
        // Trigger the winning modal
        setIsWinningModalOpen(true);
    };

    // Animation loop for the game
    const animate = (context) => {
        if (mode !== 'gameOver') {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            // Draw each box on the canvas
            for (let n = 0; n < boxes.length; n++) {
                let box = boxes[n];
                context.fillStyle = 'rgb(' + n * 16 + ',' + n * 16 + ',' + n * 16 + ')';
                context.fillRect(box.x, 600 - box.y + cameraY, box.width, height);
            }
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
// Restart function to reset all necessary states
// Delay the restart by 100 milliseconds to allow for proper reset
const restart = (context) => {
    // Reset game state and variables
    boxes = []; // Clear the boxes array
    setMoves(0); // Reset moves state to 0 when restarting
    setTimeout(() => {
        // Reinitialize the first box
        boxes[0] = {
            x: 300,
            y: 300,
            width: 200
        }; 
    mode = 'bounce'; // Set mode to 'bounce'
    cameraY = 0; // Reset cameraY
    scrollCounter = 0; // Reset scroll counter
    xSpeed = 2; // Reset xSpeed to its initial value (this was the issue)
    current = 1; // Start from the first box
    debris = { x: 0, width: 0 }; // Reset debris state
    setIsWinningModalOpen(false); // Close the modal

        // Create the new box
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
                restart(context); // Call restart when game over
            else {
                if (mode === 'bounce') mode = 'fall'; // Switch to falling mode when clicked
            }
        };
        restart(context); // Ensure game is properly reset
        animate(context); // Start the animation loop again
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
        restart(context); // Initialize game state when the component is mounted
        // animate(context); // Start animation loop
    }, []); // Empty dependency array ensures this runs once on mount

    return (
        <main>
            {/* HEADER COMPONENT */}
            <Header
                title={"Stackable"}
                onclick={handleRestartPush}
                turn_title={"Level"}
                turns={moves}
            />
            <canvas
                ref={canvasRef}
                width={800}
                height={550}
                style={{ border: '1px solid black' }}
            />
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
