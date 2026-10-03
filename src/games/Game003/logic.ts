import { LINE_SCORES, PIECE_SHAPES, PIECE_TYPES } from "./const";
import type { Cell, GameState, Piece, PieceType, StepResult } from "./type";

export function createGameState(rows: number, cols: number): GameState {
  return {
    rows,
    cols,
    board: createBoard(rows, cols),
    current: null,
    next: randomPieceType(),
    score: 0,
    lines: 0,
    status: "ready",
  };
}

export function startGame(state: GameState, firstPiece?: PieceType, nextPiece?: PieceType): StepResult {
  state.board = createBoard(state.rows, state.cols);
  state.current = null;
  state.next = nextPiece ?? state.next ?? randomPieceType();
  state.score = 0;
  state.lines = 0;
  state.status = "playing";
  const spawned = spawnPiece(state, firstPiece ?? randomPieceType());
  return emptyResult(!spawned);
}

export function pauseGame(state: GameState): boolean {
  if (state.status !== "playing") return false;
  state.status = "paused";
  return true;
}

export function resumeGame(state: GameState): boolean {
  if (state.status !== "paused") return false;
  state.status = "playing";
  return true;
}

export function canPlace(state: GameState, piece: Piece): boolean {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (!piece.shape[row][col]) continue;

      const x = piece.x + col;
      const y = piece.y + row;
      if (x < 0 || x >= state.cols || y >= state.rows) return false;
      if (y >= 0 && state.board[y][x] !== null) return false;
    }
  }
  return true;
}

export function movePiece(state: GameState, dx: number, dy: number): boolean {
  if (state.status !== "playing" || !state.current) return false;
  const moved = { ...state.current, x: state.current.x + dx, y: state.current.y + dy };
  if (!canPlace(state, moved)) return false;
  state.current.x = moved.x;
  state.current.y = moved.y;
  return true;
}

export function rotatePiece(state: GameState): boolean {
  if (state.status !== "playing" || !state.current) return false;

  const piece = state.current;
  const rotated = rotateClockwise(piece.shape);
  const kicks = [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
  ];

  for (const kick of kicks) {
    const candidate = { ...piece, shape: rotated, x: piece.x + kick.x, y: piece.y + kick.y };
    if (!canPlace(state, candidate)) continue;
    piece.shape = rotated;
    piece.x = candidate.x;
    piece.y = candidate.y;
    return true;
  }
  return false;
}

export function softDrop(state: GameState): StepResult {
  if (state.status !== "playing" || !state.current) return emptyResult(state.status === "over");
  if (movePiece(state, 0, 1)) return emptyResult(false);
  return lockAndSpawn(state);
}

export function hardDrop(state: GameState): StepResult {
  if (state.status !== "playing" || !state.current) return emptyResult(state.status === "over");
  while (movePiece(state, 0, 1)) {}
  return lockAndSpawn(state);
}

function lockAndSpawn(state: GameState): StepResult {
  const piece = state.current;
  if (!piece) return emptyResult(state.status === "over");

  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (!piece.shape[row][col]) continue;
      const x = piece.x + col;
      const y = piece.y + row;
      if (y < 0) {
        state.status = "over";
        state.current = null;
        return { locked: true, clearedLines: 0, gameOver: true };
      }
      state.board[y][x] = piece.type;
    }
  }

  state.current = null;
  const clearedLines = clearFullRows(state);
  state.lines += clearedLines;
  state.score += LINE_SCORES[clearedLines] ?? LINE_SCORES[LINE_SCORES.length - 1];
  const nextType = state.next ?? randomPieceType();
  state.next = randomPieceType();
  const spawned = spawnPiece(state, nextType);

  return { locked: true, clearedLines, gameOver: !spawned };
}

function spawnPiece(state: GameState, type: PieceType): boolean {
  const shape = cloneShape(PIECE_SHAPES[type]);
  const piece: Piece = {
    type,
    shape,
    x: Math.floor((state.cols - shape[0].length) / 2),
    y: 0,
  };
  if (!canPlace(state, piece)) {
    state.status = "over";
    state.current = null;
    return false;
  }
  state.current = piece;
  return true;
}

function clearFullRows(state: GameState): number {
  const remaining = state.board.filter((row) => row.some((cell) => cell === null));
  const cleared = state.rows - remaining.length;
  while (remaining.length < state.rows) {
    remaining.unshift(Array<Cell>(state.cols).fill(null));
  }
  state.board = remaining;
  return cleared;
}

function createBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill(null));
}

function rotateClockwise(shape: boolean[][]): boolean[][] {
  return shape[0].map((_, col) => shape.map((row) => row[col]).reverse());
}

function cloneShape(shape: boolean[][]): boolean[][] {
  return shape.map((row) => [...row]);
}

function randomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function emptyResult(gameOver: boolean): StepResult {
  return { locked: false, clearedLines: 0, gameOver };
}