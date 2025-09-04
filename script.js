// script.js

const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const newBtn = document.getElementById('new');
const modeSel = document.getElementById('mode');

// Game state
let board;              // array of 9: 'X' | 'O' | null
let xTurn;              // true if X's turn
let gameOver;
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
]; // Standard winning combinations for 3x3 tic‑tac‑toe. 

init();

function init() {
  board = Array(9).fill(null);
  xTurn = true;
  gameOver = false;
  cells.forEach(c => {
    c.textContent = '';
    c.classList.remove('x','o');
    c.disabled = false;
  });
  setStatus(`Turn: X`);
  // If CPU mode starts as O, do nothing now; player is X by default.
}

function setStatus(text){ statusEl.textContent = text; }

function currentPlayer(){ return xTurn ? 'X' : 'O'; }

function handleClick(e){
  const idx = Number(e.currentTarget.dataset.idx);
  if (gameOver || board[idx]) return;

  placeMark(idx, currentPlayer());
  const winner = getWinner(board);
  if (winner || isDraw(board)) return endGame(winner);

  // Switch turn
  xTurn = !xTurn;
  setStatus(`Turn: ${currentPlayer()}`);

  // CPU move if enabled and it's CPU's turn (O)
  if (modeSel.value === 'cpu' && !xTurn && !gameOver) {
    setTimeout(cpuMove, 250);
  }
}

function placeMark(index, mark){
  board[index] = mark;
  const cell = cells[index];
  cell.textContent = mark;
  cell.classList.add(mark.toLowerCase());
  cell.disabled = true;
}

function getWinner(b){
  for (const [a,b2,c] of WIN_LINES){
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  return null;
}

function isDraw(b){ return b.every(v => v) && !getWinner(b); }

// Simple CPU: center > corner > side, with immediate win/block checks.
function cpuMove(){
  if (gameOver) return;

  // 1) Win if possible, else block X from winning next move.
  const tryLines = (mark) => {
    for (const line of WIN_LINES){
      const [a,b2,c] = line;
      const trio = [board[a], board[b2], board[c]];
      const empties = line.filter(i => !board[i]);
      if (empties.length === 1){
        const [i] = empties;
        const countMark = trio.filter(v => v === mark).length;
        if (countMark === 2) return i;
      }
    }
    return null;
  };
  let move =
    tryLines('O') ??        // winning move
    tryLines('X');          // block

  // 2) Take center, then corners, then sides.
  if (move == null && !board[4]) move = 4;
  const corners = [0,2,6,8].filter(i => !board[i]);
  if (move == null && corners.length) move = randomChoice(corners);
  const sides = [1,3,5,7].filter(i => !board[i]);
  if (move == null && sides.length) move = randomChoice(sides);

  if (move != null){
    placeMark(move, 'O');
  }

  const winner = getWinner(board);
  if (winner || isDraw(board)) return endGame(winner);

  xTurn = true;
  setStatus(`Turn: X`);
}

function randomChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function endGame(winner){
  gameOver = true;
  cells.forEach(c => c.disabled = true);
  if (winner){
    setStatus(`Winner: ${winner}`);
  } else {
    setStatus('Draw');
  }
}

// Event wiring
cells.forEach(btn => btn.addEventListener('click', handleClick));
resetBtn.addEventListener('click', init);
newBtn.addEventListener('click', init);
modeSel.addEventListener('change', () => init());
