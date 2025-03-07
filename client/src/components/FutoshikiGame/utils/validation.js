// src/utils/validation.js

export function findRowDuplicates(grid) {
    const duplicates = new Set();
    const size = grid.length;
    for (let r = 0; r < size; r++) {
      const seen = {};
      for (let c = 0; c < size; c++) {
        const val = grid[r][c];
        if (val !== null) {
          if (!seen[val]) {
            seen[val] = [];
          }
          seen[val].push([r, c]);
        }
      }
      for (const val in seen) {
        if (seen[val].length > 1) {
          seen[val].forEach(coord => {
            duplicates.add(JSON.stringify(coord));
          });
        }
      }
    }
    return duplicates;
  }
  
  export function findColumnDuplicates(grid) {
    const duplicates = new Set();
    const size = grid.length;
    for (let c = 0; c < size; c++) {
      const seen = {};
      for (let r = 0; r < size; r++) {
        const val = grid[r][c];
        if (val !== null) {
          if (!seen[val]) {
            seen[val] = [];
          }
          seen[val].push([r, c]);
        }
      }
      for (const val in seen) {
        if (seen[val].length > 1) {
          seen[val].forEach(coord => {
            duplicates.add(JSON.stringify(coord));
          });
        }
      }
    }
    return duplicates;
  }
  
  export function findInequalityViolations(grid, inequalities) {
    const violations = new Set();
    inequalities.forEach(({ cell1, cell2, operator }) => {
      const [r1, c1] = cell1;
      const [r2, c2] = cell2;
      const val1 = grid[r1][c1];
      const val2 = grid[r2][c2];
      // If either cell is empty, skip checking for now.
      if (val1 === null || val2 === null) return;
      if (operator === '<' && !(val1 < val2)) {
        violations.add(JSON.stringify([r1, c1]));
        violations.add(JSON.stringify([r2, c2]));
      }
      if (operator === '>' && !(val1 > val2)) {
        violations.add(JSON.stringify([r1, c1]));
        violations.add(JSON.stringify([r2, c2]));
      }
    });
    return violations;
  }
  
  export function validateGrid(grid, givens, inequalities) {
    const size = grid.length;
    const rowDups = findRowDuplicates(grid);
    const colDups = findColumnDuplicates(grid);
    const ineqViolations = findInequalityViolations(grid, inequalities);
  
    // Initialize all cells as 'blue' (user-entered)
    const cellStatus = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 'blue')
    );
  
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Givens are prefilled and should be green.
        if (givens[r][c]) {
          cellStatus[r][c] = 'green';
        }
        // If any cell is in conflict (duplicate or inequality violation), mark it red.
        const coordStr = JSON.stringify([r, c]);
        if (rowDups.has(coordStr) || colDups.has(coordStr) || ineqViolations.has(coordStr)) {
          cellStatus[r][c] = 'red';
        }
      }
    }
    return cellStatus;
  }
  