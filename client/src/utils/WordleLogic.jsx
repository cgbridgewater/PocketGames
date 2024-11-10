import axios from "axios"
// Import JSON file
import wordList from '../assets/Json/WordleList.json';


// Check if the word is valid
export const validateWord = async (word) => {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    // Word is valid
    return true;
  } catch (error) {
    // Return false if the word is not found
    return false;
  }
};

// Select a random word from the word list
export const getRandomWord = () => {
  const words = wordList.words; // Access the 'words' array from the JSON
  const randomWord = words[Math.floor(Math.random() * words.length)].toUpperCase();
  return randomWord;
};







//                                                                //
// DO NOT DELETE CAN BE USED FOR FETCHING A WORD LIST FROM AN API (AXIOS NPM REQUIRED!!) //
//                                                                //

// import axios from "axios"

  // Pull a random word from the word from API source
  // export const getRandomWord = async () => {
  //   try {
  //     const res = await axios.get("https://random-word-api.herokuapp.com/word?length=5");
  //     return res.data[0].toUpperCase(); // Return the first word from the response in caps
  //   } catch (error) {
  //     console.error("Error fetching random word:", error);
  //     return null; // Return null in case of error
  //   }
  // };