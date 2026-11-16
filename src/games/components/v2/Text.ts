import * as PIXI from "pixi.js";
import BaseContainer from "./BaseContainer";

export type Options = {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  textColor?: string | number;
  textWeight?: PIXI.TextStyleFontWeight;
}

export default class Text extends BaseContainer {
  _text: string = "Text";
  _fontSize: number = 16; 
  _textColor: string | number = "0x000000";
  _textWeight: PIXI.TextStyleFontWeight = "normal";

  graphics!: PIXI.Text;
  constructor() {
    super();
    this.draw();
    return this;
  }

  draw() {
    if(this.graphics) this.removeChild(this.graphics);

    const graphics = new PIXI.Text({
      text: this._text,
      style: {
          fontSize: this._fontSize,
          fill: this._textColor,
          fontWeight: this._textWeight,
      }
    });
    this.graphics = graphics;
    this._width = graphics.width;
    this._height = graphics.height;
    this.addChild(graphics);
  }

  options(options: Options = {}) {
    this._x = options.x ?? this._x;
    this._y = options.y ?? this._y;
    this._text = options.text ?? this._text;
    this._fontSize = options.fontSize ?? this._fontSize;
    this._textColor = options.textColor ?? this._textColor;
    this._textWeight = options.textWeight ?? this._textWeight;
    this.draw();
    this.refresh();
    return this;
  }
}