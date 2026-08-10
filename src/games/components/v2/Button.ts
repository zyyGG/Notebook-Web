import * as PIXI from "pixi.js";
import Rectangle from "./Rectangle";
import Text from "./Text";
import Padding, { type PaddingParams } from "./Padding"
import BaseContainer from "./BaseContainer";

export type Options = {
  x?: number;
  y?: number;
  // width?: number;
  // height?: number;
  background?: string | number;

  text?: string;
  fontSize?: number;
  textColor?: string | number;
  textWeight?: PIXI.TextStyleFontWeight;
  
  padding?: PaddingParams;
}

export default class Button extends BaseContainer {
  _x: number = 0;
  _y: number = 0;
  _width: number = 64;
  _height: number = 28;
  _background: string | number = "0x8734CB";
  _padding: Padding = new Padding();

  _text: string = "Button";
  _fontSize: number = 24;
  _textColor: string | number = "0xFFD745";
  _textWeight: PIXI.TextStyleFontWeight = "bold";


  _graphics!: Rectangle;
  _graphicsText!: Text;

  constructor(){ 
    super(); 
    this._padding.set(8, 24);
    this.draw();
    return this;
  }

  draw() {
    this.removeChildren();

    this._graphicsText = new Text().options({
      x: this._x + this._padding.left + this._offset_x,
      y: this._y + this._padding.top + this._offset_y,
      text: this._text,
      fontSize: this._fontSize,
      textColor: this._textColor,
      textWeight: this._textWeight,
    });

    this._width = Math.floor(this._graphicsText.width + this._padding.left + this._padding.right);
    this._height = Math.floor(this._graphicsText.height + this._padding.top + this._padding.bottom);

    this._graphics = new Rectangle().options({
      x: this._x + this._offset_x,
      y: this._y + this._offset_y,
      width: this._width,
      height: this._height,
      background: this._background,
    });

    this.addChild(this._graphics, this._graphicsText);
  }

  options(options: Options) {
    this._x = options.x || this._x ;
    this._y = options.y || this._y ;
    // this._width = options.width || this._width;
    // this._height = options.height || this._height;
    this._background = options.background || this._background;

    this._text = options.text || this._text;
    this._fontSize = options.fontSize || this._fontSize;
    this._textColor = options.textColor || this._textColor;
    this._textWeight = options.textWeight || this._textWeight;
    
    this._padding = options.padding ? new Padding().set(options.padding) : this._padding;

    this.draw();
    return this
  }
}