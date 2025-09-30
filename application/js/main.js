/* main.js — vanilla JS 2048 implementation
   Clean, commented, modern. No external libs.
*/
"use strict";

/* ---------------------------
   Utilities & Constants
   --------------------------- */
const SIZE = 4;
const START_TILES = 2;
const TILE_VALUES = [2, 4];
const ANIM_DURATION = 160; // ms, keep in sync with CSS

/* DOM nodes */
const gridEl = document.getElementById("grid");
const tileContainer = document.getElementById("tile-container");
const scoreEl = document.getElementById("score");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const keepPlayingBtn = document.getElementById("keepPlayingBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const newGameBtn = document.getElementById("newGameBtn");

/* State */
let board = []; // 2D array of numbers (0 empty)
let tiles = {}; // mapping tileId -> DOM element & meta
let score = 0;
let won = false;
let keepPlaying = false;
let tileIdCounter = 0;

/* Responsive math for tile placement (based on CSS variables) */
function getCellSize() {
  // read computed tile size from CSS variable or compute quickly
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const val = style.getPropertyValue("--tile-size").trim();
  if (val.endsWith("px")) return parseFloat(val);
  // fallback: measure grid and gaps
  const gridRect = gridEl.getBoundingClientRect();
  const gap = parseFloat(style.getPropertyValue("--cell-gap")) || 16;
  const size = (gridRect.width - gap * (SIZE + 1)) / SIZE;
  return size;
}

/* ---------------------------
   DOM: build static grid cells
   --------------------------- */
function buildStaticGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      gridEl.appendChild(cell);
    }
  }
}

/* ---------------------------
   Game lifecycle
   --------------------------- */
function newGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  // remove tile DOMs
  tileContainer.innerHTML = "";
  tiles = {};
  tileIdCounter = 0;
  score = 0;
  updateScore(0);
  won = false;
  keepPlaying = false;
  hideOverlay();

  // initialize with two random tiles
  for (let i = 0; i < START_TILES; i++) {
    addRandomTile();
  }

  // render initial tiles instantly (without movement)
  renderAllTiles(true);
}

function updateScore(delta) {
  score += delta;
  scoreEl.textContent = score;
}

/* ---------------------------
   Tile helpers (DOM + positioning)
   --------------------------- */
function placeTileDom(tileId, value, row, col, options = {}) {
  // Create or update tile DOM element
  let meta = tiles[tileId];
  if (!meta) {
    const el = document.createElement("div");
    el.className = "tile";
    el.textContent = value;
    tileContainer.appendChild(el);
    meta = { id: tileId, el, row, col, value };
    tiles[tileId] = meta;
  } else {
    meta.row = row;
    meta.col = col;
    meta.value = value;
    meta.el.textContent = value;
  }

  const el = meta.el;
  // Update classes for styling by value
  el.className = "tile tile-" + value;
  if (options.new) el.classList.add("new");
  if (options.merge) el.classList.add("merge");

  // Place by transform based on grid position
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--cell-gap")) || 16;
  const cellSize = getCellSize();
  const x = gap + (cellSize + gap) * col;
  const y = gap + (cellSize + gap) * row;

  // Use translate3d for smoother animation
  // We'll set transform and let CSS transitions handle smooth movement
  requestAnimationFrame(() => {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  // After animation, cleanup animation classes
  if (options.new) {
    setTimeout(() => el.classList.remove("new"), ANIM_DURATION + 50);
  }
  if (options.merge) {
    setTimeout(() => el.classList.remove("merge"), 220);
  }
}

function removeTileDom(tileId) {
  const meta = tiles[tileId];
  if (!meta) return;
  meta.el.remove();
  delete tiles[tileId];
}

/* ---------------------------
   Board helpers
   --------------------------- */
function addRandomTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) empties.push({ r, c });
    }
  }
  if (empties.length === 0) return false;
  const { r, c } = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const id = ++tileIdCounter;
  board[r][c] = { value, id }; // store object to keep identity for animations
  placeTileDom(id, value, r, c, { new: true });
  return true;
}

function renderAllTiles(initial = false) {
  // Remove tile DOMs not present on board
  const existingIds = new Set();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (cell && typeof cell === "object") {
        existingIds.add(cell.id);
        // ensure DOM exists & is placed
        placeTileDom(cell.id, cell.value, r, c, initial ? {} : {});
      }
    }
  }
  // remove orphans
  for (const id in tiles) {
    if (!existingIds.has(Number(id))) {
      // fade and remove
      const meta = tiles[id];
      meta.el.style.transition = `opacity ${ANIM_DURATION}ms ease`;
      meta.el.style.opacity = 0;
      setTimeout(() => removeTileDom(Number(id)), ANIM_DURATION + 20);
    }
  }
}

/* ---------------------------
   Movement logic
   Core rules:
   - Slide tiles in chosen direction until blocked.
   - Merge identical tiles once per move.
   - Merges produce a new tile with sum and increase score.
   - Each tile must merge at most once per move.
   --------------------------- */

function cloneBoardStructure() {
  // deep-ish clone to not mutate original objects
  return board.map(row => row.map(cell => (cell ? { ...cell } : 0)));
}

function move(direction) {
  // directions: 'left','right','up','down'
  let moved = false;
  // We'll operate by lines: rows for left/right, columns for up/down
  const original = cloneBoardStructure();

  // helper that processes a single array of cells (non-zero items are objects)
  function processLine(cells) {
    // remove empties
    const filtered = cells.filter(Boolean);
    const result = [];
    let skip = false;
    for (let i = 0; i < filtered.length; i++) {
      if (skip) {
        skip = false;
        continue;
      }
      const current = filtered[i];
      const next = filtered[i + 1];
      if (next && current.value === next.value) {
        // merge
        const newValue = current.value + next.value;
        const newId = ++tileIdCounter; // new tile identity for merge result
        result.push({ value: newValue, id: newId, mergedFrom: [current.id, next.id] });
        updateScore(newValue);
        if (newValue === 2048) {
          // win condition triggered
          won = true;
        }
        skip = true;
      } else {
        // move as is (preserve id)
        result.push({ value: current.value, id: current.id });
      }
    }
    // fill remaining spaces with zeros
    while (result.length < SIZE) result.push(0);
    return result;
  }

  // depending on direction, iterate lines
  if (direction === "left" || direction === "right") {
    for (let r = 0; r < SIZE; r++) {
      const row = original[r].slice();
      let line = direction === "left" ? row : row.slice().reverse();
      line = processLine(line);
      if (direction === "right") line = line.reverse();
      // write back into board
      for (let c = 0; c < SIZE; c++) {
        const newCell = line[c];
        const oldCell = board[r][c];
        // compare by id/value to see if anything changed
        const changed = (() => {
          if (!oldCell && !newCell) return false;
          if (!oldCell || !newCell) return true;
          return oldCell.value !== newCell.value || oldCell.id !== newCell.id;
        })();
        if (changed) moved = true;
        board[r][c] = newCell || 0;
      }
    }
  } else {
    // up/down operate on columns
    for (let c = 0; c < SIZE; c++) {
      const col = [];
      for (let r = 0; r < SIZE; r++) col.push(original[r][c]);
      let line = direction === "up" ? col : col.slice().reverse();
      line = processLine(line);
      if (direction === "down") line = line.reverse();
      for (let r = 0; r < SIZE; r++) {
        const newCell = line[r];
        const oldCell = board[r][c];
        const changed = (() => {
          if (!oldCell && !newCell) return false;
          if (!oldCell || !newCell) return true;
          return oldCell.value !== newCell.value || oldCell.id !== newCell.id;
        })();
        if (changed) moved = true;
        board[r][c] = newCell || 0;
      }
    }
  }

  if (!moved) return false;

  // Now we must animate tile movements:
  // - Tiles with same id that moved get transform updated by renderAllTiles
  // - For merges, we need to remove merged source tiles after movement and create merged tile with merge animation
  // Strategy:
  // 1. For every merge (cell.mergedFrom), keep track to animate merge pulse
  // 2. Update tile DOM positions for pre-existing ids to their new positions (renderAllTiles)
  // 3. For merged results, remove previous tile DOMs after a short delay and create a new tile DOM with merge animation

  // track merges to replace visuals
  const merges = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (cell && cell.mergedFrom) {
        merges.push({ r, c, newCell: cell });
      }
    }
  }

  // First: render new positions for all existing tiles (note: merged tiles have new ids)
  // But we want tiles that moved (old id) to transition to their new grid cell if still present.
  // We'll update DOMs for any cells that hold existing id; for merged results, we'll create new DOM later.
  // Create a set of ids that are part of merges' sources to remove them after animation
  const mergedSourceIds = new Set();
  merges.forEach(m => {
    m.newCell.mergedFrom.forEach(srcId => mergedSourceIds.add(srcId));
  });

  // Move existing tile DOMs that remain (cells with id corresponding to existing tile)
  // But note: we created new ids for merge results, so remove merged sources visually
  // We'll first update positions for tiles that exist in board and have matching id in tiles
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = board[r][c];
      if (cell && typeof cell.id === "number") {
        const id = cell.id;
        // If this id corresponds to a newly created merged tile (id > previous counter), DOM may not exist.
        // If DOM exists (previous tile), move it.
        if (tiles[id]) {
          placeTileDom(id, cell.value, r, c);
        } else {
          // create DOM for new merged result but mark merge animation
          placeTileDom(id, cell.value, r, c, { merge: true });
        }
      }
    }
  }

  // For source tiles that were merged, animate them to fade out and remove
  mergedSourceIds.forEach(srcId => {
    if (tiles[srcId]) {
      const meta = tiles[srcId];
      // give small merge movement (scale down + fade)
      meta.el.classList.add("merge");
      meta.el.style.opacity = 0;
      setTimeout(() => removeTileDom(srcId), 240);
    }
  });

  // For normal tiles that changed id (moved but same id), they are already repositioned via placeTileDom
  // Wait animation duration and then add a new random tile and check end conditions
  setTimeout(() => {
    // After movement resolved, add a random tile
    addRandomTile();
    renderAllTiles();
    // Check win/gameover
    if (won && !keepPlaying) {
      showOverlay("You win!", "You've made the 2048 tile.", false);
    } else if (isGameOver()) {
      showOverlay("Game Over", "No moves left — try again!", true);
    }
  }, ANIM_DURATION + 30);

  return true;
}

/* ---------------------------
   Game end detection
   --------------------------- */
function isGameOver() {
  // if any empty cell -> not over
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return false;
    }
  }
  // no empty: check possible merges horizontally/vertically
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c] && board[r][c].value;
      if (c + 1 < SIZE && board[r][c + 1] && board[r][c + 1].value === v) return false;
      if (r + 1 < SIZE && board[r + 1][c] && board[r + 1][c].value === v) return false;
    }
  }
  return true;
}

/* ---------------------------
   Input: keyboard & touch
   --------------------------- */
function handleKey(e) {
  const key = e.key;
  let moved = false;
  if (key === "ArrowLeft") moved = move("left");
  else if (key === "ArrowRight") moved = move("right");
  else if (key === "ArrowUp") moved = move("up");
  else if (key === "ArrowDown") moved = move("down");
  if (moved) {
    // prevent scroll
    e.preventDefault();
  }
}

let touchStartX = 0, touchStartY = 0;
function handleTouchStart(e) {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
}
function handleTouchEnd(e) {
  if (!touchStartX && !touchStartY) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  const threshold = 30; // minimal movement
  if (Math.max(absX, absY) < threshold) {
    touchStartX = 0; touchStartY = 0;
    return;
  }
  let moved = false;
  if (absX > absY) {
    moved = dx > 0 ? move("right") : move("left");
  } else {
    moved = dy > 0 ? move("down") : move("up");
  }
  touchStartX = 0; touchStartY = 0;
  if (moved) e.preventDefault();
}

/* ---------------------------
   Modal / overlay control
   --------------------------- */
function showOverlay(title, text, allowTryAgain) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  // show try again always possible; button text handled
  tryAgainBtn.textContent = allowTryAgain ? "Try Again" : "New Game";
}
function hideOverlay() {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
}

/* ---------------------------
   UI event wiring
   --------------------------- */
document.addEventListener("keydown", handleKey);
tileContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
tileContainer.addEventListener("touchend", handleTouchEnd, { passive: false });
gridEl.addEventListener("touchstart", handleTouchStart, { passive: true });
gridEl.addEventListener("touchend", handleTouchEnd, { passive: false });

newGameBtn.addEventListener("click", () => newGame());
tryAgainBtn.addEventListener("click", () => {
  hideOverlay();
  newGame();
});
keepPlayingBtn.addEventListener("click", () => {
  keepPlaying = true;
  hideOverlay();
});

/* handle window resizes to reposition tiles precisely */
window.addEventListener("resize", () => {
  // reposition all tile DOMs using current measurement
  for (const id in tiles) {
    const meta = tiles[id];
    placeTileDom(Number(id), meta.value, meta.row, meta.col);
  }
});

/* ---------------------------
   Bootstrap
   --------------------------- */
(function init() {
  buildStaticGrid();
  // create initial numeric board with object cells for identity
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  newGame();

  // Accessibility: focus on container to receive keyboard on mobile
  tileContainer.setAttribute("tabindex", "0");
  tileContainer.focus();
})();
