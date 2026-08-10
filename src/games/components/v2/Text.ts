import * as PIXI from "pixi.js";

export type Options = {
  x?: number;
  y?: number;
  text?: string;
  fontSize?: number;
  textColor?: string | number;
  textWeight?: PIXI.TextStyleFontWeight;
}

export default class Text extends PIXI.Container {
  _x: number = 0;
  _y: number = 0;
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
      x: this._x,
      y: this._y,
      text: this._text,
      style: {
          fontSize: this._fontSize,
          fill: this._textColor,
          fontWeight: this._textWeight,
      }
    });
    this.graphics = graphics;
    this.addChild(graphics);
    return
  }

  options(options: Options = {}) {
    this._x = options.x || this._x;
    this._y = options.y || this._y;
    this._text = options.text || this._text;
    this._fontSize = options.fontSize || this._fontSize;
    this._textColor = options.textColor || this._textColor;
    this._textWeight = options.textWeight || this._textWeight;
    this.draw();
    return this;
  }
}