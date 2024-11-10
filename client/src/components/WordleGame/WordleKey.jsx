// KEYBOARD KEYS
const keysRow1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'BACKSPACE'];
const keysRow2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'ENTER'];
const keysRow3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

const WordleKey = ({ onKeyPress, keyStatus, invalidWord, guessError }) => {

  // Function to get the key's color based on its status
  const getKeyClass = (key) => {
    // If no status, default color
    if (!keyStatus[key]) return '';
    // Use feedback status as the class (correct, present, absent)
    return keyStatus[key];
  };
  // &nbsp;
  return (
    <div className="wordle-keyboard">
      {/* Error Statements */}
      {guessError ? <p id="guess_error">Incomplete guess</p> : "" }
      {invalidWord ? <p id="guess_error">Invalid Word</p> : "" }
      {/* First row */}
      <div className="wordle-key-row">
        {keysRow1.map((key, index) => (
          <button
            key={index}
            className={`wordle-key ${getKeyClass(key)}`}
            onClick={() => onKeyPress(key)}
          >
            {key === 'BACKSPACE' ? '←' : key}
          </button>
        ))}
      </div>
      {/* Second row */}
      <div className="wordle-key-row">
        {keysRow2.map((key, index) => (
          <button
            key={index}
            className={`wordle-key ${getKeyClass(key)}`}
            onClick={() => onKeyPress(key)}
          >
            {key === 'ENTER' ? '↩' : key}
          </button>
        ))}
      </div>
      {/* Third row */}
      <div className="wordle-key-row">
        {keysRow3.map((key, index) => (
          <button
            key={index}
            className={`wordle-key ${getKeyClass(key)}`}
            onClick={() => onKeyPress(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WordleKey;