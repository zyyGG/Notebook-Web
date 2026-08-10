import * as PIXI from "pixi.js";

export default abstract class BaseContainer extends PIXI.Container {
  _offset_x: number = 0;
  _offset_y: number = 0;
  _children: BaseContainer[] = [];
  setOffset(x: number, y: number) {
    this._offset_x = x;
    this._offset_y = y;
    return this;
  }

  abstract draw(): void
}