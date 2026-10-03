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
  _width: number = 100;
  _height: number = 100;
  _fixedWidth?: number;
  _fixedHeight?: number;
  _padding: Padding = new Padding();

  constructor() {
    super();
  }

  draw() {
    this.drawBackground(8);
    return this;
  }

  protected layoutChildren() {
    this._children.forEach((child) => {
      this.layoutChild(child, this._padding.left, this._padding.top);
    });
  }

  protected getContentSize() {
    return this._children.reduce((size, child) => {
      const origin = this.getChildOrigin(child);
      const childWidth = child instanceof BaseContainer ? child._width : child.width;
      const childHeight = child instanceof BaseContainer ? child._height : child.height;
      return {
        width: Math.max(size.width, origin.x + childWidth),
        height: Math.max(size.height, origin.y + childHeight),
      };
    }, { width: 0, height: 0 });
  }

  protected onChildrenChanged() {
    const contentSize = this.getContentSize();
    this._width = this._fixedWidth ?? Math.max(
      100,
      Math.ceil(contentSize.width + this._padding.left + this._padding.right),
    );
    this._height = this._fixedHeight ?? Math.max(
      100,
      Math.ceil(contentSize.height + this._padding.top + this._padding.bottom),
    );
  }

  add(...children: PIXI.Container[]): this {
    return super.add(...children);
  }

  options(options : Options) {
    this._x = options.x ?? this._x;
    this._y = options.y ?? this._y;
    if (options.width !== undefined) this._fixedWidth = options.width;
    if (options.height !== undefined) this._fixedHeight = options.height;
    this._padding = options.padding ? new Padding().set(options.padding) : this._padding;
    this._background = options.background ?? this._background;
    this.onChildrenChanged();
    this.refresh();
    return this;
  }
}