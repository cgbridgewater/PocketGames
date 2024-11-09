import axios from "axios"

// Pull a random word from the word from API source
export const getRandomWord = async () => {
  try {
    const res = await axios.get("https://random-word-api.herokuapp.com/word?length=5");
    return res.data[0].toUpperCase(); // Return the first word from the response in caps
  } catch (error) {
    console.error("Error fetching random word:", error);
    return null; // Return null in case of error
  }
};

//                                                    //
// DO NOT DELETE WE NEED THIS FOR VALIDATION OF WORDS //
//                                                    //

// Check if the word is valid
// export const validateWord = (word) => {
//   console.log("WORD: ", word)
//   return wordList.words.includes(word.toLowerCase());
// };

//                                                    //
// DO NOT DELETE WE NEED THIS FOR VALIDATION OF WORDS //
//                                                    //



//                                                               //
// DO NOT DELETE CAN BE USED FOR OUR OWN WORDS LIST IN JSON FILE //
//                                                               //

// Import JSON file
// import wordList from '../assets/Json/WordList.json';

// Select a random word from the word list
// export const getRandomWord = () => {
//   const words = wordList.words; // Access the 'words' array from the JSON
//   const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
//   console.log("THE RANDOM WORD- ", randomWord);
//   return randomWord;
// };
