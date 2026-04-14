import { Sprite, Container, Text, Color, FederatedPointerEvent, Graphics } from "pixi.js";
import type { TextStyleOptions } from "pixi.js";

type ButtonOptions = {
  text?: string,
  textStyle?: TextStyleOptions,
  background?: Color | Sprite | number,
  padding?: {
    x?: number,
    y?: number,
  },
  round?: number,
  pivotPosition?: "leftTop" | "top" | "rightTop" | "right" | "rightBottom" | "bottom" | "leftBottom" | "left" | "center",
  onClick?: (e: FederatedPointerEvent) => void,
  onDown?: (e: FederatedPointerEvent) => void,
  onUp?: (e: FederatedPointerEvent) => void,
}

export default class Button extends Container {
  constructor(options: ButtonOptions) {
    super();
    const text = options.text || " ";
    const background = options.background || undefined;
    const padding = options.padding || {x: 14, y: 4};
    padding.x = padding.x || 14;
    padding.y = padding.y || 4;
    const round = options.round || 0;

    const textSprite = new Text({
      text,
      style: {
        fill: options.textStyle?.fill || 0xffffff,
        fontSize: options.textStyle?.fontSize || 24,
        fontWeight: options.textStyle?.fontWeight || "bold",
      }
    })
    this.addChild(textSprite);

    if(padding) {
      textSprite.x = padding.x;
      textSprite.y = padding.y;
    }

    if(background instanceof Sprite) {
      this.addChild(background);
    } else if(background instanceof Color || typeof background === "number") {
      const bg = new Graphics()

      if(round) {
        bg.roundRect(0, 0, textSprite.width + (padding.x!) * 2, textSprite.height + (padding.y!) * 2, round);
      } else {
        bg.rect(0, 0, textSprite.width + (padding.x!) * 2, textSprite.height + (padding.y!) * 2);
      }

      bg.fill(background);
      this.addChildAt(bg, 0);
    }

    if(options.onClick) {
      this.interactive = true;
      this.on("pointerdown", options.onClick);
    }

    if(options.onDown) {
      this.interactive = true;
      this.on("pointerdown", options.onDown);
    }

    if(options.onUp) {
      this.interactive = true;
      this.on("pointerup", options.onUp);
    }

    // 修改中心点
    switch (options.pivotPosition) {
      case "leftTop":
        this.pivot.set(0, 0);
        break;
      case "top":
        this.pivot.set(this.width / 2, 0);
        break;
      case "rightTop":
        this.pivot.set(this.width, 0);
        break;
      case "right":
        this.pivot.set(this.width, this.height / 2);
        break;
      case "rightBottom":
        this.pivot.set(this.width, this.height);
        break;
      case "bottom":
        this.pivot.set(this.width / 2, this.height);
        break;
      case "leftBottom":
        this.pivot.set(0, this.height);
        break;
      case "left":
        this.pivot.set(0, this.height / 2);
        break;
      case "center":
      default:
        this.pivot.set(this.width / 2, this.height / 2);
        break;
    }
  }
}
