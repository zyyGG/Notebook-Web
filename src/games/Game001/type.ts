import type { Sprite } from "pixi.js";

export type Block = {
  sprite: Sprite;
  isBomb: boolean;
  isMarked: boolean;
  isRevealed: boolean; // 是否已经被揭露
  isQuestioned: boolean; // 是否被标记为问号
};

export type GameConfig = {
  rows: number;
  cols: number;
  bombs: number;
  blockSize: number;
}

export type GameSource = {
  setSource: (num: number) => void;
  onePlace: ReturnType<typeof import("./Number").default> | null;
  tenPlace: ReturnType<typeof import("./Number").default> | null;
  hundredPlace: ReturnType<typeof import("./Number").default> | null;
  source: number;
}