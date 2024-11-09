import { forwardRef } from "react";

const GameButton = forwardRef(({ className, onClick, color }, ref) => {

    // Create a button for the simon game
    return (
        <button
            className={className}
            onClick={onClick}
            ref={ref}
            color={color}
        />
    )
});

export default GameButton;
