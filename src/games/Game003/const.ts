import type { GameConfig, PieceType } from "./type";

export const DEFAULT_CONFIG: GameConfig = {
  rows: 20,
  cols: 10,
  interval: 650,
};

export const PIECE_TYPES: PieceType[] = ["I", "J", "L", "O", "S", "T", "Z"];

export const PIECE_SHAPES: Record<PieceType, boolean[][]> = {
  I: [
    [false, false, false, false],
    [true, true, true, true],
    [false, false, false, false],
    [false, false, false, false],
  ],
  J: [
    [true, false, false],
    [true, true, true],
    [false, false, false],
  ],
  L: [
    [false, false, true],
    [true, true, true],
    [false, false, false],
  ],
  O: [
    [true, true],
    [true, true],
  ],
  S: [
    [false, true, true],
    [true, true, false],
    [false, false, false],
  ],
  T: [
    [false, true, false],
    [true, true, true],
    [false, false, false],
  ],
  Z: [
    [true, true, false],
    [false, true, true],
    [false, false, false],
  ],
};

export const PIECE_COLORS: Record<PieceType, number> = {
  I: 0x34d5e5,
  J: 0x4779ed,
  L: 0xf39b38,
  O: 0xf4d447,
  S: 0x5bcc76,
  T: 0xa56ae8,
  Z: 0xef5964,
};

export const LINE_SCORES = [0, 100, 300, 500, 800];