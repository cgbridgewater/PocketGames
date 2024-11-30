// Common Functions
import { getGridSize, squeezeGrid } from "./commonFunctions"

export const generateRandomizedGrid = (height, width) => {
  const colored = generateColoredGrid(height, width); // Randomly colored grid
  const randomized = judgeShape(colored); // Add shape info based on color placement
  return randomized;
}

export const removeClump = (grid, x, y) => {
  // Remove the clicked clump of tiles
  const sequentialTiles = getSequentialTiles(grid, x, y); // List of adjacent tile coordinates
  sequentialTiles.forEach((tileXY) => {
    grid[tileXY[0]][tileXY[1]].color = "blank";
    grid[tileXY[0]][tileXY[1]].shape = "blank";
  });

  // Squeeze blank tiles
  const squeezed = squeezeGrid(grid);

  // Re-check shapes
  const shapeJudged = judgeShape(squeezed);

  return shapeJudged;
}

export const getGameState = (grid) => {
  if (grid.length === 0) return "Playing";

  const { height, width } = getGridSize(grid);
  const flatGrid = grid.flat();

  const blankTiles = flatGrid.filter(tile => tile.color === "blank").length;
  if (blankTiles === height * width) return "Game Clear!";

  const clumps = flatGrid.filter(tile => tile.color !== "blank" && tile.shape !== "rounded").length;
  if (clumps) return "Playing";

  return "Game Over!";
}

export const getPieces = (grid) => grid.length ? grid.flat().filter(tile => tile.color !== "blank").length : 0;

const colorsForRandomize = ["red", "orange", "green", "blue"];
const getRandomColor = () => colorsForRandomize[Math.floor(Math.random() * colorsForRandomize.length)];

const generateColoredGrid = (height, width) => {
  const result = [];

  [...Array(height)].forEach(() => {
    let x = [];
    [...Array(width)].forEach(() => {
      x.push({
        color: getRandomColor(),
        shape: "blank",
      });
    });
    result.push(x);
  });

  return result;
}

const judgeShape = (grid) => {
  const { height, width } = getGridSize(grid);
  const visited = [...Array(height)].map(_ => Array(width).fill(false));

  const dfs = (x, y) => {
    if (x < 0 || y < 0 || x > height - 1 || y > width - 1 || visited[x][y]) return;

    const color = grid[x][y].color;

    const setShape = (x, y) => {
      // Left Top
      if (x === 0 && y === 0) {
        if (grid[x + 1][y].color === color && grid[x][y + 1].color === color) {
          grid[x][y].shape = "topLeftRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x + 1][y].color !== color) {
          grid[x][y].shape = "leftRounded";
          return;
        } else if (grid[x + 1][y].color === color && grid[x][y + 1].color !== color) {
          grid[x][y].shape = "topRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Right Bottom
      if (x === height - 1 && y === width - 1) {
        if (grid[x - 1][y].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "bottomRightRounded";
          return;
        } else if (grid[x][y - 1].color === color && grid[x - 1][y].color !== color) {
          grid[x][y].shape = "rightRounded";
          return;
        } else if (grid[x - 1][y].color === color && grid[x][y - 1].color !== color) {
          grid[x][y].shape = "bottomRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Right Top
      if (x === 0 && y === width - 1) {
        if (grid[x + 1][y].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "topRightRounded";
          return;
        } else if (grid[x][y - 1].color === color && grid[x + 1][y].color !== color) {
          grid[x][y].shape = "rightRounded";
          return;
        } else if (grid[x + 1][y].color === color && grid[x][y - 1].color !== color) {
          grid[x][y].shape = "topRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Left Bottom
      if (x === height - 1 && y === 0) {
        if (grid[x - 1][y].color === color && grid[x][y + 1].color === color) {
          grid[x][y].shape = "bottomLeftRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x - 1][y].color !== color) {
          grid[x][y].shape = "leftRounded";
          return;
        } else if (grid[x - 1][y].color === color && grid[x][y + 1].color !== color) {
          grid[x][y].shape = "bottomRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Top Edge
      if (x === 0) {
        if (grid[x][y + 1].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "square";
          return;
        } else if (grid[x + 1][y].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "topRightRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x + 1][y].color === color) {
          grid[x][y].shape = "topLeftRounded";
          return;
        } else if (grid[x][y - 1].color === color && grid[x][y + 1].color !== color) {
          grid[x][y].shape = "rightRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x][y - 1].color !== color) {
          grid[x][y].shape = "leftRounded";
          return;
        } else if (grid[x + 1][y].color === color) {
          grid[x][y].shape = "topRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Bottom Edge
      if (x === height - 1) {
        if (grid[x][y + 1].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "square";
          return;
        } else if (grid[x - 1][y].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "bottomRightRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x - 1][y].color === color) {
          grid[x][y].shape = "bottomLeftRounded";
          return;
        } else if (grid[x][y - 1].color === color && grid[x][y + 1].color !== color) {
          grid[x][y].shape = "rightRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x][y - 1].color !== color) {
          grid[x][y].shape = "leftRounded";
          return;
        } else if (grid[x - 1][y].color === color) {
          grid[x][y].shape = "bottomRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Left Edge
      if (y === 0) {
        if (grid[x + 1][y].color === color && grid[x - 1][y].color === color) {
          grid[x][y].shape = "square";
          return;
        } else if (grid[x + 1][y].color === color && grid[x][y + 1].color === color) {
          grid[x][y].shape = "topLeftRounded";
          return;
        } else if (grid[x][y + 1].color === color && grid[x - 1][y].color === color) {
          grid[x][y].shape = "bottomLeftRounded";
          return;
        } else if (grid[x][y + 1].color === color) {
          grid[x][y].shape = "leftRounded";
          return;
        } else if (grid[x + 1][y].color === color && grid[x - 1][y].color !== color) {
          grid[x][y].shape = "topRounded";
          return;
        } else if (grid[x - 1][y].color === color && grid[x + 1][y].color !== color) {
          grid[x][y].shape = "bottomRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Right Edge
      if (y === width - 1) {
        if (grid[x + 1][y].color === color && grid[x - 1][y].color === color) {
          grid[x][y].shape = "square";
          return;
        } else if (grid[x + 1][y].color === color && grid[x][y - 1].color === color) {
          grid[x][y].shape = "topRightRounded";
          return;
        } else if (grid[x][y - 1].color === color && grid[x - 1][y].color === color) {
          grid[x][y].shape = "bottomRightRounded";
          return;
        } else if (grid[x][y - 1].color === color) {
          grid[x][y].shape = "rightRounded";
          return;
        } else if (grid[x + 1][y].color === color && grid[x - 1][y].color !== color) {
          grid[x][y].shape = "topRounded";
          return;
        } else if (grid[x - 1][y].color === color && grid[x + 1][y].color !== color) {
          grid[x][y].shape = "bottomRounded";
          return;
        } else {
          grid[x][y].shape = "rounded";
          return;
        }
      }

      // Others
      if ((grid[x + 1][y].color === color && grid[x - 1][y].color === color) || (grid[x][y + 1].color === color && grid[x][y - 1].color === color)) {
        grid[x][y].shape = "square";
        return;
      } else if (grid[x - 1][y].color === color && grid[x][y - 1].color === color && grid[x + 1][y].color !== color && grid[x][y + 1].color !== color) {
        grid[x][y].shape = "bottomRightRounded";
        return;
      } else if (grid[x - 1][y].color === color && grid[x][y + 1].color === color && grid[x + 1][y].color !== color && grid[x][y - 1].color !== color) {
        grid[x][y].shape = "bottomLeftRounded";
        return;
      } else if (grid[x + 1][y].color === color && grid[x][y - 1].color === color && grid[x - 1][y].color !== color && grid[x][y + 1].color !== color) {
        grid[x][y].shape = "topRightRounded";
        return;
      } else if (grid[x + 1][y].color === color && grid[x][y + 1].color === color && grid[x - 1][y].color !== color && grid[x][y - 1].color !== color) {
        grid[x][y].shape = "topLeftRounded";
        return;
      } else if (grid[x][y - 1].color === color && grid[x][y + 1].color !== color && grid[x + 1][y].color !== color && grid[x - 1][y].color !== color) {
        grid[x][y].shape = "rightRounded";
        return;
      } else if (grid[x][y + 1].color === color && grid[x][y - 1].color !== color && grid[x + 1][y].color !== color && grid[x - 1][y].color !== color) {
        grid[x][y].shape = "leftRounded";
        return;
      } else if (grid[x - 1][y].color === color && grid[x][y + 1].color !== color && grid[x + 1][y].color !== color && grid[x][y - 1].color !== color) {
        grid[x][y].shape = "bottomRounded";
        return;
      } else if (grid[x + 1][y].color === color && grid[x][y + 1].color !== color && grid[x - 1][y].color !== color && grid[x][y - 1].color !== color) {
        grid[x][y].shape = "topRounded";
        return;
      } else {
        grid[x][y].shape = "rounded";
        return;
      }
    };

    setShape(x, y);
    visited[x][y] = true;

    dfs(x - 1, y); //上
    dfs(x, y + 1); //右
    dfs(x + 1, y); //下
    dfs(x, y - 1); //左
  };

  dfs(0, 0);

  return grid;
};

const getSequentialTiles = (grid, initX, initY) => {
  const { height, width } = getGridSize(grid);
  const visited = [...Array(height)].map(() => Array(width).fill(false));
  const sequentialTiles = [];
  const color = grid[initX][initY].color;

  const dfs = (x, y) => {
    if (x < 0 || y < 0 || x > height - 1 || y > width - 1 || visited[x][y] || grid[x][y].color !== color) return;
    sequentialTiles.push([x, y]);
    visited[x][y] = true;

    dfs(x + 1, y); // Down
    dfs(x, y - 1); // Left
    dfs(x - 1, y); // Up
    dfs(x, y + 1); // Right
  };

  dfs(initX, initY);
  return sequentialTiles;
}
