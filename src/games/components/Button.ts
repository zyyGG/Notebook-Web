import { Sprite, Container, Text, Color, FederatedPointerEvent, Graphics } from "pixi.js";
import type { TextStyleOptions } from "pixi.js";

type ButtonOptions = {
  text?: string | undefined,
  textStyle?: TextStyleOptions | undefined,
  background?: Color | Sprite | number,
  padding?: {
    x: number,
    y: number,
  }
  onClick?: (e: FederatedPointerEvent) => void,
}

export default class Button extends Container {
  constructor(options: ButtonOptions) {
    super();
    const text = options.text || " ";
    const background = options.background || 0x000000;
    const onClick = options.onClick;

    const textSprite = new Text({
      text,
      style: {
        fill: options.textStyle?.fill || 0xffffff,
        fontSize: options.textStyle?.fontSize || 24,
        fontWeight: options.textStyle?.fontWeight || "bold",
      }
    })
    this.addChild(textSprite);

    if(options.padding) {
      textSprite.x = options.padding.x;
      textSprite.y = options.padding.y;
    }

    if(background instanceof Sprite) {
      this.addChild(background);
    } else {
      const bg = new Graphics()
      if(options.padding){
        bg.rect(0, 0, textSprite.width + options.padding.x * 2, textSprite.height + options.padding.y * 2);
      } else {
        bg.rect(0, 0, textSprite.width, textSprite.height);
      }
      
      bg.fill(background);
      this.addChildAt(bg, 0);
    }

    if(onClick) {
      this.interactive = true;
      this.on("pointerdown", onClick);
    }
  }
}
