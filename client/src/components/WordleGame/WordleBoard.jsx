const WordleBoard = ({ guesses = [], currentGuess, guessError }) => {

  // Render a completed guess with feedback colors for each letter (correct, present, absent)
  const renderGuess = (guess, index) => {
    if (!guess || !guess.guess || !guess.feedback) return null;
    // Create a row for the guess, rendering each letter with its feedback color
    return (
      <div className="wordle-row" key={index}>
        {guess.guess.split('').map((letter, i) => (
          <div className={`wordle-cell ${guess.feedback[i]}`} key={i}>
            {letter}
          </div>
        ))}
      </div>
    );
  };

  // Render an empty row with 5 cells
  const renderEmptyRow = (index) => (
    <div className="wordle-row" key={index}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="wordle-cell" key={i}></div>
      ))}
    </div>
  );

  // Ensure we render exactly 6 rows
  const rowsToRender = [
    // Existing guesses (max 6)
    ...guesses,
     // Only add an empty row for the current guess if less than 6 guesses
    ...(guesses.length < 6 ? [null] : []),
  ];

  return (
    <div className="wordle-board">
      {/* Render exactly 6 rows: */}
      {rowsToRender.map((guess, index) => {
        if (guess) {
          return renderGuess(guess, index); // Render completed guess
        }
        if (index === guesses.length) {
          // If it's the current guess row, render it
          return (
            <>
              <div className="wordle-row" key={index}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="wordle-cell" key={i}>
                    {/* Show the current letters being typed */}
                    {currentGuess[i] || ''} 
                  </div>
                ))}
              </div>
              { guessError ? <p id="guess_error">incomplete guess!</p> :  "" }
            </>
          );
        }
        // Render empty rows for all unused guesses
        return renderEmptyRow(index);
      })}
    </div>
  );
};

export default WordleBoard;