// Common Functions
import { notifyRendering } from "./hooks/commonFunctions";

const Tile = ({ shape, color, onClick, debug }) => {

    if (debug) notifyRendering("Tile");

  switch (shape) {
    case "blank":
      return <div className="fusion_tile fusion_blank" />;
    case "square":
      return <div className="fusion_tile top" style={{ backgroundColor: color }} onClick={onClick} />;
    case "rounded":
      return <div className="fusion_tile fusion_rounded fusion_shine" style={{ backgroundColor: color }} />;
    case "topRounded":
      return <div className="fusion_tile fusion_top fusion_shine" style={{ backgroundColor: color }} onClick={onClick} />;
    case "bottomRounded":
      return <div className="fusion_tile fusion_bottom" style={{ backgroundColor: color }} onClick={onClick} />;
    case "leftRounded":
      return <div className="fusion_tile fusion_left" style={{ backgroundColor: color }} onClick={onClick} />;
    case "rightRounded":
      return <div className="fusion_tile fusion_right fusion_shine" style={{ backgroundColor: color }} onClick={onClick} />;
    case "topLeftRounded":
      return <div className="fusion_tile fusion_topleft" style={{ backgroundColor: color }} onClick={onClick} />;
    case "topRightRounded":
      return <div className="fusion_tile fusion_topright fusion_shine" style={{ backgroundColor: color }} onClick={onClick} />;
    case "bottomLeftRounded":
      return <div className="fusion_tile fusion_bottomleft" style={{ backgroundColor: color }} onClick={onClick} />;
    case "bottomRightRounded":
      return <div className="fusion_tile fusion_bottomright" style={{ backgroundColor: color }} onClick={onClick} />;
    default:
      return <div className="fusion_tile fusion_black" />;
  }
};

export default Tile;
