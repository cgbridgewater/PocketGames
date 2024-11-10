import { useState, useEffect } from 'react';
import { getRandomWord, validateWord } from '../utils/WordleLogic';
import WordleBoard from '../components/WordleGame/WordleBoard';
import WordleKey from '../components/WordleGame/WordleKey';
import Header from '../components/GameHeader/GameHeader';
import WinningModal from '../components/Modals/WinningModal';

const Wordle = ({ isWinningModalOpen, setIsWinningModalOpen }) => {
  const [targetWord, setTargetWord] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [guessError, setGuessError] = useState(false);
  const [keyStatus, setKeyStatus] = useState({});
  const [invalidWord , setInvalidWord] = useState(false)

  // Initialize the target word when the component mounts
  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    // Check if the user won after each guess
    if (guesses.length > 0 && guesses[guesses.length - 1].correct) {
      handleWin();
      return;
    }
    // Check if the user lost after each guess
    if (guesses.length >= 6 && gameStatus !== 'won') {
      handleLose();
    }
  }, [guesses, gameStatus]);

  // Handle the win
  const handleWin = () => {
    setGameStatus('won');
    setIsWinningModalOpen(true);
  };

  // Handle the loss
  const handleLose = () => {
    setGameStatus('lost');
    setIsWinningModalOpen(true);
  };

  // Handle keyboard event for external typing
  useEffect(() => {
    const handleKeyboardEvent = (event) => {
      if (gameStatus === 'playing') {
        const key = event.key.toUpperCase();
        if (key === 'ENTER') {
          // Submit guess on Enter key
          handleGuess();
        } else if (key === 'BACKSPACE') {
          // Handle backspace
          setCurrentGuess(currentGuess.slice(0, -1));
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < 5) {
          // Add letter to current guess
          setCurrentGuess(currentGuess + key);
        }
      }
    };
    window.addEventListener('keydown', handleKeyboardEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyboardEvent);
    };
  }, [currentGuess, gameStatus, guesses]);

    // handle keyboard button push
    const handleKeyPress = (key) => {
      if (gameStatus === 'playing') {
        if (key === 'ENTER') {
          // Submit guess on Enter key
          handleGuess();
        } else if (key === 'BACKSPACE') {
          // Handle backspace
          setCurrentGuess(currentGuess.slice(0, -1));
        } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < 5) {
          // Add letter to current guess
          setCurrentGuess(currentGuess + key);
        }
      }
    };

  // Process guess
  const handleGuess = async () => {
    if (currentGuess.length === 5) {
      // Validate the word first
      const isValid = await validateWord(currentGuess.toLowerCase());
      if (!isValid) {
        // Set the error message if the word is invalid
        setGuessError(false)
        setInvalidWord(true);
        // Clear the invalid
        setCurrentGuess("")

        // Stop further execution if the word is invalid
        return;
      } else {
        // Clear any previous error message
        setInvalidWord(false);
      }
  
      // If the word is valid, proceed with the rest of the logic
      const feedback = checkGuess(currentGuess);
      const correct = feedback.every(f => f === 'correct');
      setGuesses([...guesses, { guess: currentGuess, feedback, correct }]);
      setGuessError(false);
      setCurrentGuess('');
      
      // Update keyStatus based on the feedback
      const updatedKeyStatus = { ...keyStatus };
      currentGuess.split('').forEach((letter, index) => {
        const letterFeedback = feedback[index];
        if (letterFeedback === 'correct') {
          updatedKeyStatus[letter] = 'correct';
        } else if (letterFeedback === 'present' && updatedKeyStatus[letter] !== 'correct') {
          updatedKeyStatus[letter] = 'present';
        } else if (letterFeedback === 'absent' && !updatedKeyStatus[letter]) {
          updatedKeyStatus[letter] = 'absent';
        }
      });
  
      setKeyStatus(updatedKeyStatus);
    } else if (currentGuess.length < 5) {
      setGuessError(true);
      setInvalidWord(false)
      setCurrentGuess("")
    }
  };
  

  // Check each letter to the target word and return feedback
  const checkGuess = (guess) => {
    const feedback = [];
    // Convert target word into an array for easy comparison
    const targetWordArr = targetWord.split('');
  
    // First pass: Check for "correct" letters (green)
    // To count occurrences of letters in the target word
    const targetLetterCount = {};
    targetWordArr.forEach(letter => targetLetterCount[letter] = (targetLetterCount[letter] || 0) + 1);
  
    // Mark correct letters (green)
    for (let i = 0; i < 5; i++) {
      if (guess[i] === targetWord[i]) {
        feedback.push('correct');
        // Decrease the count of the correct letter in targetWord
        targetLetterCount[guess[i]]--;
      } else {
        // Placeholder for letters that are not correct yet
        feedback.push(null);
      }
    }
  
    // Second pass: Check for "present" letters (yellow)
    for (let i = 0; i < 5; i++) {
      // Only check letters that haven't been marked as correct yet
      if (feedback[i] === null) {
        // If the letter exists in the target word
        if (targetLetterCount[guess[i]] > 0) {
          // Mark it as present (yellow)
          feedback[i] = 'present';
          // Decrease the count of the present letter in targetWord
          targetLetterCount[guess[i]]--; 
        } else {
          // If the letter doesn't exist in the target word, mark it as absent (gray)
          feedback[i] = 'absent';
        }
      }
    }
  
    // Return the feedback for each letter in the guess
    return feedback;
  };

  // Reset board function
  const resetGame = async () => {
    setGuesses([]);
    setKeyStatus({});
    setIsWinningModalOpen(false);
    const word = await getRandomWord();
    setGameStatus('playing');
    setInvalidWord(false)
    setTargetWord(word);
    setCurrentGuess('');
    setGuessError(false);
  };

  return (
    <main>
      <Header title="Wordle" onclick={resetGame} turn_title="Guesses Left" turns={6 - guesses.length} />
      <div className="wordle-container">
        <WordleBoard guesses={guesses} currentGuess={currentGuess} />
        <WordleKey onKeyPress={handleKeyPress} keyStatus={keyStatus} guessError={guessError} invalidWord={invalidWord} />
      </div>
      {/* Modals for win/loss */}
      {isWinningModalOpen && gameStatus === 'lost' && (
        <WinningModal message1="You lost! The word was " message2={`"${targetWord.toLowerCase()}"`} turns="" onClose={resetGame} />
      )}
      {isWinningModalOpen && gameStatus === 'won' && (
        <WinningModal message1="You win! You took " message2={guesses.length === 1 ? "guess!" : "guesses!"} turns={guesses.length} onClose={resetGame} />
      )}
    </main>
  );
};

export default Wordle;
