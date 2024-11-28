// React
import { memo } from "react";

// Custom Components
import Tile from "./Tile";

// Common Functions
import { notifyRendering } from "./hooks/commonFunctions";

// Type
import { hex } from "./utils/Color";

const GridElement = ({ grid, handleTileClick, debug }) => {
  if (debug) notifyRendering("Grid");

  return (
    <div className="vstack">
      {grid.map((line, lineIdx) => {
        return (
          <div key={lineIdx} className="hstack">
            {line.map((piece, pieceIdx) => {
              return (
                <div key={`${lineIdx},${pieceIdx}`} className="fusion_tile_container">
                  {lineIdx === 0 ? (
                    <div className="fusion_tile_separator_horizontal" />
                  ) : grid[lineIdx - 1][pieceIdx].color === grid[lineIdx][pieceIdx].color ? (
                    <div
                      className="fusion_tile_separator_horizontal"
                      style={{ backgroundColor: hex[grid[lineIdx][pieceIdx].color] }}
                    />
                  ) : (
                    <div className="fusion_tile_separator_horizontal" />
                  )}
                  <div className="fusion_tile_wrapper">
                    {pieceIdx === 0 ? (
                      <div className="fusion_tile_separator_vertical" />
                    ) : grid[lineIdx][pieceIdx - 1].color === grid[lineIdx][pieceIdx].color ? (
                      <div
                        className="fusion_tile_separator_vertical"
                        style={{ backgroundColor: hex[grid[lineIdx][pieceIdx].color] }}
                      />
                    ) : (
                      <div className="fusion_tile_separator_vertical" />
                    )}
                    <Tile
                      shape={piece.shape}
                      color={hex[piece.color]}
                      onClick={() => handleTileClick(lineIdx, pieceIdx)}
                      debug={debug}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default memo(GridElement);
