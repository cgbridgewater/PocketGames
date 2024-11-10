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
    ...guesses
  ];

  // Make sure we always have 6 rows (either filled with guesses or empty rows)
  while (rowsToRender.length < 6) {
    rowsToRender.push(null);  // Push empty rows for any remaining slots
  }

  return (
    <div className="wordle-board">
      {rowsToRender.map((guess, index) => {
        if (index < guesses.length) {
          // Render completed guess
          return renderGuess(guess, index);
        }
        if (index === guesses.length) {
          // Render current guess row
          return (
            <div className="wordle-row" key={`current-${index}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div className="wordle-cell" key={`current-letter-${index}-${i}`}>
                  {currentGuess[i] || ''}
                </div>
              ))}
            </div>
          );
        }
        // Render empty rows for all remaining slots
        return renderEmptyRow(index);
      })}
    </div>
  );
};

export default WordleBoard;
