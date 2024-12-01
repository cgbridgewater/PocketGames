import { useEffect, useState } from "react";
import SingleCard from "../components/Memory/SingleCard";
import WinningModal from "../components/Modals/WinningModal";
import Header from "../components/GameHeader/GameHeader";
import Card1 from "../assets/images/Card1.png";
import Card2 from "../assets/images/Card2.png";
import Card3 from "../assets/images/Card3.png";
import Card4 from "../assets/images/Card4.png";
import Card5 from "../assets/images/Card5.png";
import Card6 from "../assets/images/Card6.png";
import Card7 from "../assets/images/Card7.png";
import Card8 from "../assets/images/Card8.png";
import Card9 from "../assets/images/Card9.png";
import Card10 from "../assets/images/Card10.png";
import Card11 from "../assets/images/Card11.png";
import Card12 from "../assets/images/Card12.png";
import Card13 from "../assets/images/Card13.png";
import Card14 from "../assets/images/Card14.png";
import Card15 from "../assets/images/Card15.png";

// card face images
const cardImages = [
    { src: Card1, matched: false },
    { src: Card2, matched: false },
    { src: Card3, matched: false },
    { src: Card4, matched: false },
    { src: Card5, matched: false },
    { src: Card6, matched: false },
    { src: Card7, matched: false },
    { src: Card8, matched: false },
    { src: Card9, matched: false },
    { src: Card10, matched: false },
    { src: Card11, matched: false },
    { src: Card12, matched: false },
    { src: Card13, matched: false },
    { src: Card14, matched: false },
    { src: Card15, matched: false },
];

function Memory({ isWinningModalOpen, setIsWinningModalOpen }) {

    // States
    const [cards, setCards] = useState([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState(null);
    const [choiceTwo, setChoiceTwo] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [difficulty, setDifficulty] = useState("easy");

    // FUNCTIONS

    // Reset Game (Shuffle Cards) based on difficulty
    const resetGame = () => {
        let selectedCards;
        if (difficulty === "easy") {
            selectedCards = [...cardImages.slice(0, 6), ...cardImages.slice(0, 6)];
        } else if (difficulty === "medium") {
            selectedCards = [...cardImages.slice(0, 10), ...cardImages.slice(0, 10)];
        } else {
            selectedCards = [...cardImages.slice(0, 15), ...cardImages.slice(0, 15)];
        }
        // Shuffle and randomize cards
        const shuffledCards = selectedCards
            .sort(() => Math.random() - 0.5)
            .map((card) => ({ ...card, id: Math.random() }));
        setCards(shuffledCards);
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns(0);
        setIsWinningModalOpen(false);
    };

    // Handle Card Choices
    const handleChoice = (card) => {
        if (disabled || card.id === choiceOne?.id) return;
        choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    };

    // Check And Handle Win
    const checkIfWon = (currentCards) => {
        if (currentCards.every((card) => card.matched)) {
        setIsWinningModalOpen(true);
        }
    };

    // Reset Selected Cards And Increase Turns Counter
    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((prevTurns) => prevTurns + 1);
        setDisabled(false);
    };

    // Handle Difficulty Change
    const handleDifficultyChange = (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
    };

    // USE EFFECTS
    // Effect for updating game when difficulty changes
    useEffect(() => {
        resetGame();
    }, [difficulty]);


    // Compare Selected Cards, Check For Win 
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setCards((prevCards) => {
                const newCards = prevCards.map((card) =>
                    card.src === choiceOne.src ? { ...card, matched: true } : card
                );
                setTimeout(() => checkIfWon(newCards), 750);
                return newCards;
                });
                resetTurn();
            } else {
                setTimeout(() => resetTurn(), 1000);
            }
        }
    }, [choiceOne, choiceTwo]);

    return (
        <main>
            {/* HEADER COMPONENT */}
            <Header
                title={"Magic Memory"}
                onclick={resetGame}
                turn_title={"Turns"}
                turns={turns}
                howTo={"Uncover matching pairs hidden beneath a grid of face-down cards in this engaging memory game. Choose from three difficulty levels: easy features a smaller grid for beginners, medium adds more cards for a bit more challenge, and hard tests even the sharpest memories with a larger grid and more pairs. The game ends when all pairs are found" }
            />
            {/* DIFFICULTY BUTTONS */}
            <div className="button_box">
                {/* EASY */}
                <button
                    className={difficulty === "easy" ? "selected" : ""}
                    onClick={() => handleDifficultyChange("easy")}
                >
                    Easy
                </button>
                {/* MEDIUM */}
                <button
                    className={difficulty === "medium" ? "selected" : ""}
                    onClick={() => handleDifficultyChange("medium")}
                >
                    Medium
                </button>
                {/* HARD */}
                <button
                    className={difficulty === "hard" ? "selected" : ""}
                    onClick={() => handleDifficultyChange("hard")}
                >
                    Hard
                </button>
            </div>
            {/* GAME */}
            <div className={`card_grid grid_difficulty_${difficulty}`}>
                {cards.map((card) => (
                    <SingleCard
                        key={card.id}
                        card={card}
                        handleChoice={handleChoice}
                        flipped={card === choiceOne || card === choiceTwo || card.matched}
                        disabled={disabled}
                    />
                ))}
            </div>
            {/* MODAL POPUP */}
            {isWinningModalOpen && (
                <WinningModal
                    message1="You finished in"
                    message2="moves!"
                    turns={turns}
                    onClose={resetGame}
                />
            )}
        </main>
    );
}

export default Memory;