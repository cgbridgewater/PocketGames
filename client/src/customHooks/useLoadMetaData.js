// Import React Magic
import { useLocation } from 'react-router-dom';

// Import Json File
import gameData from '../assets/Json/GameList.json';

const useLoadMetaData = () => {

  // Get Route Location
  const location = useLocation();

  // Find the game data that matches the current URL path
  const currentGame = gameData.find(game => location.pathname.includes(game.url));

  if (currentGame && currentGame.meta) {
    return currentGame.meta;  // Return the metadata for the game
  }

  if (location.pathname === "/games"){
    return {
      title: "PocketGames - Menu",
      description: "Play a variety of quick and fun browser-based games at My Game Center. No sign-ups, no downloads, just play!",
      keywords: "play games, browser games, online games, no signup games, quick games, free games",
      ogTitle: "Pocket Games - Menu",
      ogDescription: "Enjoy Color Fusion, Lights Out, Memory Games, Tetris, Wordle, and more!",
      ogImage: "../assets/images/icon.jpg",
      ogUrl: "",
    };
  }

  // Fallback metadata for the homepage or a generic page
  return {
    title: "Pocket Games",
    description: "Play a variety of quick and fun browser-based games at My Game Center. No sign-ups, no downloads, just play!",
    keywords: "play games, browser games, online games, no signup games, quick games, free games",
    ogTitle: "Pocket Games",
    ogDescription: "Enjoy Color Fusion, Lights Out, Memory Games, Tetris, Wordle, and more!",
    ogImage: "../assets/images/icon.jpg",
    ogUrl: "",
  };
};

export default useLoadMetaData;