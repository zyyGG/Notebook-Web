export type PieceType = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
export type Cell = PieceType | null;
export type GameStatus = "ready" | "playing" | "over";

export type Piece = {
  type: PieceType;
  shape: boolean[][];
  x: number;
  y: number;
};

export type GameConfig = {
  rows: number;
  cols: number;
  interval: number;
};

export type GameState = {
  rows: number;
  cols: number;
  board: Cell[][];
  current: Piece | null;
  next: PieceType | null;
  score: number;
  lines: number;
  status: GameStatus;
};

export type StepResult = {
  locked: boolean;
  clearedLines: number;
  gameOver: boolean;
};