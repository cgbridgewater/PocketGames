import { useState, useEffect } from 'react';
import CardBack from "../../assets/images/MemoryMagicCover.png";

export default function SingleCard({ card, handleChoice, flipped, disabled }) {

    // STATES
    const [showFront, setShowFront] = useState(false);

    // FUNCTIONS
    const handleClick = () => {
        if (!disabled) {
            handleChoice(card);
            setShowFront(true);
        }
    };

    // USE EFFECTS
    useEffect(() => {
        if (!flipped) {
            const timer = setTimeout(() => {
                setShowFront(false);
            }, 250);
            return () => clearTimeout(timer);
        } else {
            setShowFront(true);
        }
    }, [flipped]);

    return (
        <div 
            className={`memory_card ${flipped ? "flipped" : ""}`} 
            onClick={handleClick}
        >
            <img 
                className="front" 
                src={showFront ? card.src : CardBack} 
                alt="card front" 
            />
            <img 
                className="back" 
                src={CardBack} 
                alt="card back" 
            />
        </div>
    );
}
