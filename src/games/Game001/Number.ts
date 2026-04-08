import { Assets, Sprite } from "pixi.js";

export default function createNumber(num: number | "dot" = 0, height = 20) {
  const myNum = {
    sprite: null as Sprite | null,
    setNum(newNum: number | "dot") {
      num = newNum;
      if (myNum.sprite) {
        myNum.sprite.texture = Assets.get(`number_${num}`);
      }
    },
  };
  myNum.sprite = new Sprite({
    texture: Assets.get(`number_${num}`),
    height,
    width:
      (Assets.get(`number_${num}`).width / Assets.get(`number_${num}`).height) *
      height,
  });
  return myNum;
}
