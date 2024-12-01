import { useState, useEffect } from "react";
import Header from "../components/GameHeader/GameHeader";
import Cell from "../components/LightsOut/LightsOutCell";
import WinningModal from "../components/Modals/WinningModal";

const LightsOut = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
    const [moves, setMoves] = useState(0);
    const [size, setSize] = useState(5);
    const [chanceLightStartsOn, setChanceLightStartsOn] = useState(0.25);

    // Function to randomly set whether a light is on or off
    const randomLight = () => Math.random() < chanceLightStartsOn;

    // Create the grid based on size and chanceLightStartsOn
    const createGrid = () => 
        Array.from({ length: size }).map(() =>
        Array.from({ length: size }).map(() => randomLight())
    );

    // State for the board/grid
    const [board, setBoard] = useState({ grid: createGrid() });

    // Function to toggle a single light on/off
    const toggleLight = (cellIndex) => {
        let [cellRowIndex, cellColIndex] = cellIndex.split("");
        cellRowIndex = parseInt(cellRowIndex);
        cellColIndex = parseInt(cellColIndex);
        setBoard((currSt) => ({
        ...currSt,
        grid: currSt.grid.map((row, rowIndex) =>
            rowIndex === cellRowIndex
            ? row.map((col, colIndex) => (colIndex === cellColIndex ? !col : col))
            : row
        ),
        }));
    };

    // Function to toggle the clicked light and its neighbors
    const toggleAllLights = (cellIndex) => {
        let [cellRowIndex, cellColIndex] = cellIndex.split("");
        cellRowIndex = parseInt(cellRowIndex);
        cellColIndex = parseInt(cellColIndex);
        // Increment Moves
        setMoves((prevMoves) => prevMoves + 1);
        // Toggle clicked cell
        toggleLight(cellIndex); 
        // Toggle right
        toggleLight([cellRowIndex, cellColIndex + 1].join(""));
        // Toggle left
        toggleLight([cellRowIndex, cellColIndex - 1].join(""));
        // Toggle down
        toggleLight([cellRowIndex + 1, cellColIndex].join(""));
        // Toggle up
        toggleLight([cellRowIndex - 1, cellColIndex].join(""));
    };

    // Function to check if all lights are off (win condition)
    const hasWon = () => board.grid.every((row) => row.every((cell) => !cell));
    // Check for win condition in useEffect whenever the board changes

    useEffect(() => {
        if (hasWon()) {
            setIsWinningModalOpen(true);
        }
    }, [board]);

  // Handle reset push
    const resetGame = () => {
        setMoves(0); 
        setBoard({ grid: createGrid() });
        setIsWinningModalOpen(false);
    };

    // Sets board and ensures modal is closed on page load
    useEffect(() => {
        resetGame()
    }, [])

    return (
        <main>
            {/* HEADER COMPONENT */}
            <Header 
                title={"Lights Out"}
                onclick={resetGame}
                turn_title={"Moves"}
                turns={moves}
                howTo={"Each light on the grid can be on or off. Pressing a light toggles its state and the adjacent lights (above, below, left, and right). The goal is to turn off all the lights by finding the right sequence of moves."}
            />
            {/* GAME */}
            <div className="lightsout_board">
                { board.grid.map((row, rowIndex) => (
                    <div className="lightsout_board_row" key={rowIndex}>
                        {row.map((col, colIndex) => (
                            <Cell
                            key={[rowIndex, colIndex].join("")}
                            cellIndex={[rowIndex, colIndex].join("")}
                            isOn={board.grid[rowIndex][colIndex]}
                            toggleLight={toggleAllLights}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {/* MODAL POPUP */}
            {isWinningModalOpen && (
                <WinningModal
                message1="You finished in"
                message2="moves!"
                turns={moves}
                onClose={resetGame}
                />
            )}
        </main>
    );
};

export default LightsOut;