// import { useState, useEffect, useRef } from 'react';
// import puzzles from '../assets/Json/FutoshikiPuzzles.json';
import Header from '../components/GameHeader/GameHeader';

function FutoshikiGame() {

  return (
    <main>
    {/* HEADER COMPONENT */}
      <Header 
        title={"Color Fusion"} 
        // onclick={handleResetButtonClick} 
        turn_title={""} 
        turns={0}  
        howTo={"The objective of the game is to fill each row and column with unique numbers, from 1 to 5, while adhering to the inequality constraints provided between some of the squares. These constraints, indicated by greater than (>) or less than (<) symbols, dictate the relationship between adjacent numbers, adding an extra layer of challenge. Make your move by placing numbers in empty squares, ensuring that no number repeats in any row or column and that all inequalities are respected. The game is won once the entire grid is correctly filled, satisfying both the uniqueness of the numbers and all inequality conditions."}  
      />
    </main>
  );
}

export default FutoshikiGame;
