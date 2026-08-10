import * as PIXI from "pixi.js";
import Padding, { PaddingParams} from "./Padding";
import BaseContainer from "./BaseContainer";

export type Options = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  padding?: PaddingParams;
  background?: string | number;
}

export default class Container extends BaseContainer {
  _x: number = 0;
  _y: number = 0;
  _width: number = 100;
  _height: number = 100;
  _padding: Padding = new Padding();
  _background: string | number = "0xff000033";
  
  graphics!: PIXI.Graphics;
  constructor() {
    super();
    this._padding = new Padding();
    this.draw();
    return this;
  }

  draw() {
    if(this.graphics) this.removeChild(this.graphics);

    const graphics = new PIXI.Graphics();
    this.graphics = graphics
      .beginPath()
      .roundRect(this._x, this._y, this._width, this._height, 8)
      .closePath()
      .fill(this._background)
    this.addChild(graphics);
    return this;
  }

  add(...containers: BaseContainer[]) {
    const offsetX = this._x + this._padding.left;
    const offsetY = this._y + this._padding.top;
    containers.forEach((container) => {
      this.addChild(container);
      container.setOffset(offsetX, offsetY);
      this._children.push(container);
      container.draw();
    });
    
    return this;
  }

  options(options : Options) {
    this._x = options.x || this._x;
    this._y = options.y || this._y;
    this._width = options.width || this._width;
    this._height = options.height || this._height;
    this._padding = options.padding ? new Padding().set(options.padding) : this._padding;
    this._background = options.background || this._background;

    const offsetX = this._x + this._padding.left;
    const offsetY = this._y + this._padding.top;
    this._children.forEach((container) => {
      container.setOffset(offsetX, offsetY);
    });
    this.draw()
    return this;
  }
}