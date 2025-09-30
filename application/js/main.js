const gridSize = 4;
const gridContainer = document.getElementById("grid-container");
const scoreElement = document.getElementById("score");
const newGameBtn = document.getElementById("new-game");

let grid, score;

function startGame() {
  grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  score = 0;
  updateScore();
  clearTiles();
  addRandomTile();
  addRandomTile();
}

function clearTiles() {
  document.querySelectorAll(".tile").forEach(tile => tile.remove());
}

function updateScore() {
  scoreElement.textContent = score;
}

function addRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length === 0) return;
  const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  grid[r][c] = value;
  createTile(r, c, value);
}

function createTile(row, col, value) {
  const tile = document.createElement("div");
  tile.classList.add("tile", "new");
  tile.textContent = value;
  tile.dataset.value = value;
  gridContainer.appendChild(tile);
  setTilePosition(tile, row, col);
}

function setTilePosition(tile, row, col) {
  const cellSize = 107; // width/height of tile
  const cellGap = 15;   // gap between cells
  tile.style.top = `${15 + row * (cellSize + cellGap)}px`;
  tile.style.left = `${15 + col * (cellSize + cellGap)}px`;
}

function move(direction) {
  let moved = false;
  const merged = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  const traverse = (r, c) => {
    if (grid[r][c] === 0) return false;
    let nr = r, nc = c;
    while (true) {
      let nextR = nr + direction.dr;
      let nextC = nc + direction.dc;
      if (
        nextR < 0 || nextR >= gridSize ||
        nextC < 0 || nextC >= gridSize
      ) break;
      if (grid[nextR][nextC] === 0) {
        grid[nextR][nextC] = grid[nr][nc];
        grid[nr][nc] = 0;
        nr = nextR; nc = nextC;
        moved = true;
      } else if (
        grid[nextR][nextC] === grid[nr][nc] &&
        !merged[nextR][nextC]
      ) {
        grid[nextR][nextC] *= 2;
        score += grid[nextR][nextC];
        grid[nr][nc] = 0;
        merged[nextR][nextC] = true;
        moved = true;
        break;
      } else {
        break;
      }
    }
    return moved;
  };

  const order = [...Array(gridSize).keys()];
  if (direction.dr === 1) order.reverse();
  if (direction.dc === 1) order.reverse();

  for (let r of order) {
    for (let c of order) {
      traverse(r, c);
    }
  }

  if (moved) {
    updateTiles();
    addRandomTile();
    updateScore();
    if (isGameOver()) alert("Game Over!");
    if (isGameWon()) {
      if (confirm("You reached 2048! Keep playing?") === false) startGame();
    }
  }
}

function updateTiles() {
  document.querySelectorAll(".tile").forEach(tile => tile.remove());
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] !== 0) {
        createTile(r, c, grid[r][c]);
      }
    }
  }
}

function isGameOver() {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === 0) return false;
      if (
        r < gridSize - 1 && grid[r][c] === grid[r + 1][c] ||
        c < gridSize - 1 && grid[r][c] === grid[r][c + 1]
      ) return false;
    }
  }
  return true;
}

function isGameWon() {
  return grid.flat().includes(2048);
}

document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp": move({ dr: -1, dc: 0 }); break;
    case "ArrowDown": move({ dr: 1, dc: 0 }); break;
    case "ArrowLeft": move({ dr: 0, dc: -1 }); break;
    case "ArrowRight": move({ dr: 0, dc: 1 }); break;
  }
});

newGameBtn.addEventListener("click", startGame);

startGame();
