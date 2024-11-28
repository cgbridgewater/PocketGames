import { Color } from "./Color";
import { Shape } from "./Shape";

// Grid is a 2D array of Tile objects, so we can leave it as a regular array in JS
export const Tile = {
  color: Color,  // Placeholder value; the actual color will be assigned dynamically
  shape: Shape,  // Placeholder value; the actual shape will be assigned dynamically
};

// Grid will be a 2D array of Tile objects
export const Grid = [
  [Tile],  // Example of a grid with a single Tile (for reference)
];
