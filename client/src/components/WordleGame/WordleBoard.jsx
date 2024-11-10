const WordleBoard = ({ guesses = [], currentGuess }) => {

  // Render a completed guess with feedback colors for each letter (correct, present, absent)
  const renderGuess = (guess, index) => {
    if (!guess || !guess.guess || !guess.feedback) return null;
    return (
      <div className="wordle-row" key={`guess-${index}`}>
        {guess.guess.split('').map((letter, i) => (
          <div className={`wordle-cell ${guess.feedback[i]}`} key={`letter-${index}-${i}`}>
            {letter}
          </div>
        ))}
      </div>
    );
  };

  // Render an empty row with 5 cells
  const renderEmptyRow = (index) => (
    <div className="wordle-row" key={`empty-${index}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div className="wordle-cell" key={`empty-${index}-cell-${i}`}></div>
      ))}
    </div>
  );

  // Ensure we always render 6 rows, current guess into the first empty row
  const rowsToRender = [
    // Existing guesses (max 6)
    ...guesses

    // ...(guesses.length < 6 ? [null] : []),  // Add an empty row for the current guess if < 6 guesses
  ];

  // Make sure we always have 6 rows (either filled with guesses or empty rows)
  while (rowsToRender.length < 6) {
    rowsToRender.push(null);  // Push empty rows for any remaining slots
  }

  return (
    <div className="wordle-board">
      {rowsToRender.map((guess, index) => {
        if (guess) {
          return renderGuess(guess, index); // Render completed guess
        }

        // If it's the current guess row (first available empty row), render it
        if (index === guesses.length) {
          return (
            <>
              <div className="wordle-row" key={`current-${index}`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="wordle-cell" key={`current-letter-${index}-${i}`}>
                    {currentGuess[i] || ''}  {/* Show current letters being typed */}
                  </div>
                ))}
              </div>
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
