import { useState, useRef, useEffect } from "react";
import Header from "../components/GameHeader/GameHeader";
import GameButton from "../components/SimonSays/SimonButton";
import WinningModal from "../components/Modals/WinningModal";

// color options
const colors = ["simon_green", "simon_red", "simon_yellow", "simon_blue"];

function Simon({ isWinningModalOpen, setIsWinningModalOpen }) {
    // states
    const [sequence, setSequence] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [playingIdx, setPlayingIdx] = useState(0);
    const [turns, setTurns] = useState(0);

    // refs
    const greenRef = useRef(null);
    const redRef = useRef(null);
    const yellowRef = useRef(null);
    const blueRef = useRef(null);

    // functions
    const resetGame = () => {
        setSequence([]);
        setPlaying(false);
        setPlayingIdx(0);
        setIsWinningModalOpen(false);
    };

    const addNewColor = () => {
        const color = colors[Math.floor(Math.random() * 4)];
        const newSequence = [...sequence, color];
        setSequence(newSequence);
    };

    const handleNextLevel = () => {
        if (!playing) {
            setPlaying(true);
            addNewColor();
        }
    };

    const handleColorClick = (e) => {
        if (playing) {
            e.target.classList.add("opacity");
            setTimeout(() => {
                e.target.classList.remove("opacity");
                const clickColor = e.target.getAttribute("color");
                // clicked the correct color of the sequence
                if (sequence[playingIdx] === clickColor) {
                // clicked the last color of the sequence
                    if (playingIdx === sequence.length - 1) {
                        setTimeout(() => {
                        setPlayingIdx(0);
                        addNewColor();
                        }, 250);
                    }
                    // missing some colors of the sequence to be clicked
                    else {
                        setPlayingIdx(playingIdx + 1);
                    }
                }
                // clicked the incorrect color of the sequence
                else {
                    const newTurns = [sequence.length];
                    setTurns(newTurns);
                    resetGame();
                    setIsWinningModalOpen(true);
                }
            }, 150);
        }
    };

    // useEffects
    useEffect(() => {
        resetGame();
    },[])

    useEffect(() => {
        if (sequence.length > 0) {
            const showSequence = (idx = 0) => {
                let ref = null;
                if (sequence[idx] === "simon_green") ref = greenRef;
                if (sequence[idx] === "simon_red") ref = redRef;
                if (sequence[idx] === "simon_yellow") ref = yellowRef;
                if (sequence[idx] === "simon_blue") ref = blueRef;
                // Create Flashes
                setTimeout(() => {
                    ref.current.classList.add("highlight");
                    setTimeout(() => {
                    ref.current.classList.remove("highlight");
                    if (idx < sequence.length - 1) showSequence(idx + 1);
                    }, 200);
                }, 350);
            };
            showSequence();
        }
    }, [sequence]);

    return (
        <main>
            {/* HEADER COMPONENT */}
            <Header title={"Simon Says"} onclick={resetGame} turn_title={"Level"} turns={sequence.length}/>
            {/* GAME */}
            <div className="simon_container">
                <div>
                    {/* GREEN BUTTON */}
                    <GameButton 
                        color="simon_green" 
                        className="simon_green" 
                        onClick={handleColorClick} 
                        ref={greenRef} 
                    />
                    {/* RED BUTTON */}
                    <GameButton 
                        color="simon_red" 
                        className="simon_red" 
                        onClick={handleColorClick} 
                        ref={redRef} 
                    />
                </div>
                <div>
                    {/* YELLOW BUTTON */}
                    <GameButton 
                        color="simon_yellow" 
                        className="simon_yellow" 
                        onClick={handleColorClick} 
                        ref={yellowRef} 
                    />
                    {/* BLUE BUTTON */}
                    <GameButton 
                        color="simon_blue" 
                        className="simon_blue" 
                        onClick={handleColorClick} 
                        ref={blueRef} 
                    />
                </div>
                {/* START BUTTON */}
                <button id="play_button" onClick={handleNextLevel}>
                    {sequence.length === 0 ? "Start" : sequence.length}
                </button>
            </div>
            {/* MODAL POPUP */}
            {isWinningModalOpen && (
                <WinningModal message1="You made it to level" message2="!" turns={turns} onClose={resetGame} />
            )}
        </main>
    );
}

export default Simon;