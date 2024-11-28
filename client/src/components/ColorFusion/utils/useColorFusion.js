// React Hooks
import { useState, useEffect, useMemo, useCallback } from "react";

// Grid Functions
import { generateRandomizedGrid, removeClump, getGameState, getPieces } from "../hooks/gridFunctions";

// Common Functions
import { notifyRendering } from "../hooks/commonFunctions";

export const useColorFusion = (props) => {
  if (props.debug) notifyRendering("useColorFusion");

  const [grid, setGrid] = useState([]);
  const gameState = useMemo(() => getGameState(grid), [grid]);
  const piecesLeft = useMemo(() => getPieces(grid), [grid]);

  useEffect(() => {
    setGrid(generateRandomizedGrid(props.height, props.width));
  }, [props.height, props.width]);

  useEffect(() => {
    if (props.debug) console.table(grid);
  }, [grid, props.debug]);

  const handleTileClick = useCallback((x, y) => {
    console.log("TEST")
    if (grid[x][y].color === "blank") return;
    if (props.debug) console.log(`${x}, ${y} Clicked!`);
    setGrid(removeClump(grid, x, y));
  }, [grid, props.debug]);

  const handleResetButtonClick = () => {
    setGrid(generateRandomizedGrid(props.height, props.width));
  };

  return { grid, gameState, piecesLeft, handleTileClick, handleResetButtonClick };
};
