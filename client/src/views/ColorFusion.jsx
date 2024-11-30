// React Hooks
import { useMemo, useEffect, useState } from "react";

// Custom Hooks
import { useColorFusion } from "../components/ColorFusion/utils/useColorFusion";

// Custom Components
import Grid from "../components/ColorFusion/Grid";
import Header from "../components/GameHeader/GameHeader";

// Libraries
import { useLocation } from "react-router-dom";

// Font Icons
import { FaRotateLeft, FaInfo } from "react-icons/fa6";

// Common Functions
import { notifyRendering } from "../components/ColorFusion//hooks/commonFunctions";
import WinningModal from "../components/Modals/WinningModal";


const ColorFusion = () => {
  const { search } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const height = useMemo(() => Number(params.get("height")) || 15, [params]);
  const width = useMemo(() => Number(params.get("width")) || 15, [params]);
  const debug = useMemo(() => params.has("debug") ? (params.get("debug")).toLowerCase() === "true" : false, [params]);

  if (debug) notifyRendering("App");

  const { grid, gameState, piecesLeft, handleTileClick, handleResetButtonClick } = useColorFusion({ height, width, debug });
  const [isInfoOpen, setIsInfoOpen] = useState(false);



  if (grid.flat().length === height * width) {
    return (
      <main>
        {/* HEADER COMPONENT */}
        <Header title={"Color Fusion"} onclick={handleResetButtonClick} turn_title={"Pieces Left"} turns={piecesLeft}  />
        {/* GAME */}
        <div className="fusion_game_wrapper" >
          <div className="fusion_grid_container" >
            <Grid grid={grid} handleTileClick={handleTileClick} debug={debug} />
            {
              gameState !== "Playing" && !isInfoOpen ? (
                // <div className="fusion_overlay">
                //   <div className="fusion_info">
                //     <h3>{gameState}</h3>
                //     <button className="fusion_button" onClick={handleResetButtonClick}>Play Again</button>
                //   </div>
                // </div>
                <WinningModal 
                  message1={piecesLeft >= 1 ?"GameOver - ": "Winner!! " }
                  message2={piecesLeft >= 1 ? `${piecesLeft} pieces left!` : "All Pieces Cleared!"} 
                  turns={''}
                  onClose={handleResetButtonClick} 
                />
              ) : null
            }
            {
              isInfoOpen ? (
                <div  className="fusion_overlay">
                  <div className="fusion_info">
                    <h3>How To Play</h3>
                      <p>
                        This game is played by erasing clumps of two or more pieces of the same color attached to each other, and the game is completed when all the pieces are finally erased.
                      </p>
                    <div className="button_box">
                      <button
                        onClick={() => setIsInfoOpen(false)}
                        >
                        Close
                      </button>
                    </div>
                  </div>
                </ div>
              ) : null
            }
          </div>
          <div className="fusion_footer"  onClick={() => { if (isInfoOpen) setIsInfoOpen(false) }}>
            <div className="icon_container">
              <div onClick={handleResetButtonClick} title="Reset" >
                <FaRotateLeft />
              </div>
              <div onClick={() => setIsInfoOpen(true)} title="Info" >
                <FaInfo />
              </div>
            </div>
          </div>
        </div>
        <div className="box"></div>
      </main>
    );
  }

  return null;
};

export default ColorFusion;
