import { Sprite, Container, Text, Color, FederatedPointerEvent, Graphics } from "pixi.js";
import type { TextStyleOptions } from "pixi.js";

type Background = Color | number | "transparent";

export type ButtonOptions = {
  text?: string,
  textStyle?: TextStyleOptions,
  background?: Background,
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
  public textSprite: Text;
  public options: ButtonOptions;

  private _backgroundSprite?: Graphics;
  
  set text(value: string) {
    this.textSprite.text = value;
    this._updateBackground();
  }

  set background(value: Background) {
    this._backgroundSprite?.destroy();
    const bg = new Graphics()
    bg.clear();
    bg.roundRect(0, 0, this.textSprite.width + this.textSprite.x * 2, this.textSprite.height + this.textSprite.y * 2, this.options.round || 0);
    bg.fill(value);
    this._backgroundSprite = bg;
    this.addChildAt(bg, 0);
  }

  constructor(options?: ButtonOptions) {
    super();
    options = this.options = options || {};
    const text = options.text || " ";
    const background = options.background || "0x333333";
    const textStyle = options.textStyle || {
      fill: 0xffffff,
      fontSize: 18 ,
      fontWeight: "bold",
    };
    const padding = options.padding || {x: 14, y: 4};
    padding.x = padding.x || 14;
    padding.y = padding.y || 4;
    const round = options.round || 0;
    const pivotPosition = options.pivotPosition || "center";


    const textSprite = new Text({
      text,
      style: textStyle,
    })
    this.textSprite = textSprite;
    this.addChild(textSprite);

    if(padding) {
      textSprite.x = padding.x;
      textSprite.y = padding.y;
    }

    if(background !== undefined) {
      const bg = new Graphics()

      if(round) {
        bg.roundRect(0, 0, textSprite.width + (padding.x!) * 2, textSprite.height + (padding.y!) * 2, round);
      } else {
        bg.rect(0, 0, textSprite.width + (padding.x!) * 2, textSprite.height + (padding.y!) * 2);
      }

      bg.fill(background);
      this._backgroundSprite = bg;
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
    switch (pivotPosition) {
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

  private _updateBackground() {
    if(this._backgroundSprite) {
      this._backgroundSprite.width = this.textSprite.width + this.textSprite.x * 2;
      this._backgroundSprite.height = this.textSprite.height + this.textSprite.y * 2;
    }
  }
}
