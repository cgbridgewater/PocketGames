// React Hooks
import { useMemo, useState } from "react";

// Custom Hooks
import { useColorFusion } from "../components/ColorFusion/utils/useColorFusion";

// Custom Components
import Grid from "../components/ColorFusion/Grid";
import Header from "../components/GameHeader/GameHeader";

// Libraries
import { useLocation } from "react-router-dom";

// Common Functions
import { notifyRendering } from "../components/ColorFusion//hooks/commonFunctions";
import WinningModal from "../components/Modals/WinningModal";


const ColorFusion = ({ isTimerPaused, setIsTimerPaused }) => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const height = useMemo(() => Number(params.get("height")) || 15, [params]);
  const width = useMemo(() => Number(params.get("width")) || 15, [params]);
  const debug = useMemo(() => params.has("debug") ? (params.get("debug")).toLowerCase() === "true" : false, [params]);

  if (debug) notifyRendering("App");

  const { grid, gameState, piecesLeft, handleTileClick, handleResetButtonClick } = useColorFusion({ height, width, debug });
  const [ isWinningModalOpen, setIsWinningModalOpen ] = useState(false);



  if (grid.flat().length === height * width) {
    return (
      <main>
        {/* HEADER COMPONENT */}
        <Header 
          title={"Color Fusion"} 
          onclick={handleResetButtonClick} 
          turn_title={"Pieces Left"} 
          turns={piecesLeft}  
          howTo={"This game is played by erasing clumps of two or more pieces of the same color attached to each other, and the game is completed when all the pieces are finally erased."}  
          isTimerPaused={isTimerPaused}
          setIsTimerPaused={setIsTimerPaused}
        />
        {/* GAME */}
        <div className="fusion_game_wrapper" >
          <div className="fusion_grid_container" >
            <Grid grid={grid} handleTileClick={handleTileClick} debug={debug} />
            {
              gameState !== "Playing" && !isWinningModalOpen ? (
                <WinningModal 
                  message1={piecesLeft >= 1 ?"GameOver - ": "Winner!! " }
                  message2={piecesLeft >= 1 ? `${piecesLeft} pieces left!` : "All Pieces Cleared!"} 
                  turns={''}
                  onClose={handleResetButtonClick} 
                />
              ) : null
            }
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default ColorFusion;
