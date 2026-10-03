import * as PIXI from "pixi.js";
import Padding, { type PaddingParams } from "./Padding"
import BaseContainer from "./BaseContainer";

export type Options = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  background?: string | number;
  padding?: PaddingParams;
  onClick?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onDown?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onUp?: ((event: PIXI.FederatedPointerEvent) => void) | null;
}

export default class Button extends BaseContainer {
  _x: number = 0;
  _y: number = 0;
  _width: number = 64;
  _height: number = 28;
  _fixedWidth?: number;
  _fixedHeight?: number;
  _padding: Padding = new Padding();

  _onClick?: (event: PIXI.FederatedPointerEvent) => void;
  _onDown?: (event: PIXI.FederatedPointerEvent) => void;
  _onUp?: (event: PIXI.FederatedPointerEvent) => void;

  private readonly handlePointerTap = (event: PIXI.FederatedPointerEvent) => {
    this._onClick?.(event);
  };
  private readonly handlePointerDown = (event: PIXI.FederatedPointerEvent) => {
    this._onDown?.(event);
  };

  private readonly handlePointerUp = (event: PIXI.FederatedPointerEvent) => {
    this._onUp?.(event);
  };

  constructor(){ 
    super(); 
    this._background = "0x8734CB";
    this._padding.set(8, 24);
    this.measure();
  }

  draw() {
    this.drawBackground();
  }

  protected layoutChildren() {
    this._children.forEach((child) => {
      this.layoutChild(child, this._padding.left, this._padding.top);
    });
  }

  protected onChildrenChanged() {
    this.measure();
  }

  private measure() {
    const contentWidth = this._children.reduce((width, child) => {
      const origin = this.getChildOrigin(child);
      return Math.max(width, origin.x + (child instanceof BaseContainer ? child._width : child.width));
    }, 0);
    const contentHeight = this._children.reduce((height, child) => {
      const origin = this.getChildOrigin(child);
      return Math.max(height, origin.y + (child instanceof BaseContainer ? child._height : child.height));
    }, 0);
    this._width = this._fixedWidth ?? Math.max(64, Math.ceil(contentWidth + this._padding.left + this._padding.right));
    this._height = this._fixedHeight ?? Math.max(28, Math.ceil(contentHeight + this._padding.top + this._padding.bottom));
    this.hitArea = new PIXI.Rectangle(0, 0, this._width, this._height);
  }

  private updateClickHandler() {
    this.off("pointertap", this.handlePointerTap);
    if (this._onClick) {
      this.eventMode = "static";
      this.cursor = "pointer";
      this.on("pointertap", this.handlePointerTap);
    } else {
      this.eventMode = "passive";
      this.cursor = "default";
    }
  }

  private updatePointerDownHandler() {
    this.off("pointerdown", this.handlePointerDown);
    if (this._onDown) {
      this.eventMode = "static";
      this.on("pointerdown", this.handlePointerDown);
    }
  }

  private updatePointerUpHandler() {
    this.off("pointerup", this.handlePointerUp);
    if (this._onUp) {
      this.eventMode = "static";
      this.on("pointerup", this.handlePointerUp);
    }
  }

  options(options: Options) {
    this._x = options.x ?? this._x;
    this._y = options.y ?? this._y;
    if (options.width !== undefined) this._fixedWidth = options.width;
    if (options.height !== undefined) this._fixedHeight = options.height;
    this._background = options.background ?? this._background;
    this._padding = options.padding ? new Padding().set(options.padding) : this._padding;
    if ("onClick" in options) this._onClick = options.onClick ?? undefined;
    if ("onDown" in options) this._onDown = options.onDown ?? undefined;
    if ("onUp" in options) this._onUp = options.onUp ?? undefined;

    this.measure();
    this.updateClickHandler();
    this.updatePointerDownHandler();
    this.updatePointerUpHandler();
    this.refresh();
    return this
  }
}