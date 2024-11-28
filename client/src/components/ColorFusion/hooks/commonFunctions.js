// Rotate functions
export const rotateLeft = (a) => a[0].map((_, c) => a.map(r => r[c])).reverse();
export const rotateRight = (a) => a[0].map((_, c) => a.map(r => r[c]).reverse());

export const getGridSize = (grid) => {
  const height = grid.length;
  const width = grid[0].length;
  return { height, width };
};

export const squeezeGrid = (grid) => {
  // Create an array without blank tiles, and add blank tiles back at the bottom
  const bottomPadded = rotateRight(grid).map(arr => arr.filter(tile => tile.color !== "blank").concat(arr.filter(tile => tile.color === "blank")));

  // Find rows where all the tiles have color 'blank'
  const blankRows = bottomPadded.filter(row => row.every(cell => cell.color === "blank"));

  // Move the found blank rows to the bottom
  return rotateLeft(bottomPadded.filter(row => !blankRows.includes(row)).concat(blankRows));
};

export const notifyRendering = (componentName) => console.log(`%c${componentName}.tsx`, "color:white; border:solid 1px #0188d1; padding:1px 4px; border-radius:4px;", "Rendered");
