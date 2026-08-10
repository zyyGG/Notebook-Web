import * as PIXI from "pixi.js";

export type Options = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  background?: string | number;
  text?: string;
};

export default class Rectangle extends PIXI.Container {
  _x: number = 0;
  _y: number = 0;
  _width: number = 100;
  _height: number = 100;
  _background: string | number = "white";
  graphics!: PIXI.Graphics;

  constructor() {
    super();
    this.draw();
    return this;
  }

  draw() {
    if(this.graphics) this.removeChild(this.graphics);

    const graphics = new PIXI.Graphics();
    this.graphics = graphics;
    graphics
      .beginPath()
      .moveTo(this._x, this._y)
      .lineTo(this._x + this._width, this._y)
      .lineTo(this._x + this._width, this._y + this._height)
      .lineTo(this._x, this._y + this._height)
      .closePath()
      .fill(this._background);
    this.addChild(graphics);

    return graphics;
  }

  options(options: Options = {}) {
    this._x = options.x || this._x || 0;
    this._y = options.y || this._y || 0;
    this._width = options.width || this._width || 100;
    this._height = options.height || this._height || 100;
    this._background = options.background || this._background || "white";
    this.draw();
    return this;
  }
}
