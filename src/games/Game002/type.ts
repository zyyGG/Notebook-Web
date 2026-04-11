import { Sprite } from "pixi.js"

export type Block = {
  sprite: Sprite,
  row: number,
  col: number,
  matchId: number, // 用于匹配的id
}