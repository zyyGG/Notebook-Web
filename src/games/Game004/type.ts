import * as PIXI from "pixi.js"

export type Card = {
  id: string; // 每一张实体牌都要有唯一 id，即使牌面相同
  suit: string; // 
  rank: string;
  faceUp: boolean;
  sprite: PIXI.Sprite,
  backsprite: PIXI.Sprite,
  cardSeque?: CardSeque,
};

export type CardSeque = {
    id: number;
    container: PIXI.Container<PIXI.ContainerChild>;
    position: number[];
    column: Card[],
}