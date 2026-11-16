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
  cursor?: PIXI.Cursor;
  onClick?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onDown?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onUp?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onUpOutside?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerEnter?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerLeave?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerMove?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerOver?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerOut?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onPointerCancel?: ((event: PIXI.FederatedPointerEvent) => void) | null;
  onRightClick?: ((event: PIXI.FederatedPointerEvent) => void) | null;
}

export default class Button extends BaseContainer {
  _x: number = 0;
  _y: number = 0;
  _width: number = 64;
  _height: number = 28;
  /**@descript 修正宽度 */
  _fixedWidth?: number;
  /**@descript 修正高度 */
  _fixedHeight?: number;
  _padding: Padding = new Padding();
  _cursor: PIXI.Cursor = 'pointer'

  _onClick?: (event: PIXI.FederatedPointerEvent) => void;
  _onDown?: (event: PIXI.FederatedPointerEvent) => void;
  _onUp?: (event: PIXI.FederatedPointerEvent) => void;
  _onUpOutside?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerEnter?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerLeave?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerMove?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerOver?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerOut?: (event: PIXI.FederatedPointerEvent) => void;
  _onPointerCancel?: (event: PIXI.FederatedPointerEvent) => void;
  _onRightClick?: (event: PIXI.FederatedPointerEvent) => void;

  private readonly handlePointerTap = (event: PIXI.FederatedPointerEvent) => {
    this._onClick?.(event);
  };
  private readonly handlePointerDown = (event: PIXI.FederatedPointerEvent) => {
    this._onDown?.(event);
  };

  private readonly handlePointerUp = (event: PIXI.FederatedPointerEvent) => {
    this._onUp?.(event);
  };
  private readonly handlePointerUpOutside = (event: PIXI.FederatedPointerEvent) => {
    this._onUpOutside?.(event);
  };
  private readonly handlePointerEnter = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerEnter?.(event);
  };
  private readonly handlePointerLeave = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerLeave?.(event);
  };
  private readonly handlePointerMove = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerMove?.(event);
  };
  private readonly handlePointerOver = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerOver?.(event);
  };
  private readonly handlePointerOut = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerOut?.(event);
  };
  private readonly handlePointerCancel = (event: PIXI.FederatedPointerEvent) => {
    this._onPointerCancel?.(event);
  };
  private readonly handleRightClick = (event: PIXI.FederatedPointerEvent) => {
    this._onRightClick?.(event);
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
    const childBounds = this._children.map((child) => {
      const origin = this.getChildOrigin(child);
      return {
        origin,
        width: child instanceof BaseContainer ? child._width : child.width,
        height: child instanceof BaseContainer ? child._height : child.height,
      };
    });
    const bounds = childBounds.reduce(
      (result, child) => ({
        left: Math.min(result.left, child.origin.x),
        top: Math.min(result.top, child.origin.y),
        right: Math.max(result.right, child.origin.x + child.width),
        bottom: Math.max(result.bottom, child.origin.y + child.height),
      }),
      { left: 0, top: 0, right: 0, bottom: 0 },
    );
    const contentWidth = bounds.right - bounds.left;
    const contentHeight = bounds.bottom - bounds.top;
    const offsetX =
      this._padding.left +
      (this._width - this._padding.left - this._padding.right - contentWidth) / 2 -
      bounds.left;
    const offsetY =
      this._padding.top +
      (this._height - this._padding.top - this._padding.bottom - contentHeight) / 2 -
      bounds.top;

    this._children.forEach((child) => {
      this.layoutChild(child, offsetX, offsetY);
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

  private updatePointerHandlers() {
    this.off("pointertap", this.handlePointerTap);
    this.off("pointerdown", this.handlePointerDown);
    this.off("pointerup", this.handlePointerUp);
    this.off("pointerupoutside", this.handlePointerUpOutside);
    this.off("pointerenter", this.handlePointerEnter);
    this.off("pointerleave", this.handlePointerLeave);
    this.off("pointermove", this.handlePointerMove);
    this.off("pointerover", this.handlePointerOver);
    this.off("pointerout", this.handlePointerOut);
    this.off("pointercancel", this.handlePointerCancel);
    this.off("rightclick", this.handleRightClick);

    if (this._onClick) this.on("pointertap", this.handlePointerTap);
    if (this._onDown) this.on("pointerdown", this.handlePointerDown);
    if (this._onUp) this.on("pointerup", this.handlePointerUp);
    if (this._onUpOutside) this.on("pointerupoutside", this.handlePointerUpOutside);
    if (this._onPointerEnter) this.on("pointerenter", this.handlePointerEnter);
    if (this._onPointerLeave) this.on("pointerleave", this.handlePointerLeave);
    if (this._onPointerMove) this.on("pointermove", this.handlePointerMove);
    if (this._onPointerOver) this.on("pointerover", this.handlePointerOver);
    if (this._onPointerOut) this.on("pointerout", this.handlePointerOut);
    if (this._onPointerCancel) this.on("pointercancel", this.handlePointerCancel);
    if (this._onRightClick) this.on("rightclick", this.handleRightClick);

    const hasPointerHandlers = [
      this._onClick,
      this._onDown,
      this._onUp,
      this._onUpOutside,
      this._onPointerEnter,
      this._onPointerLeave,
      this._onPointerMove,
      this._onPointerOver,
      this._onPointerOut,
      this._onPointerCancel,
      this._onRightClick,
    ].some(Boolean);
    this.eventMode = hasPointerHandlers ? "static" : "passive";
    this.cursor = hasPointerHandlers ? this._cursor : "default";
  }

  options(options: Options) {
    this._x = options.x ?? this._x;
    this._y = options.y ?? this._y;
    if (options.width !== undefined) this._fixedWidth = options.width;
    if (options.height !== undefined) this._fixedHeight = options.height;
    this._background = options.background ?? this._background;
    this._padding = options.padding ? new Padding().set(options.padding) : this._padding;
    if (options.cursor !== undefined) this._cursor = options.cursor;
    if ("onClick" in options) this._onClick = options.onClick ?? undefined;
    if ("onDown" in options) this._onDown = options.onDown ?? undefined;
    if ("onUp" in options) this._onUp = options.onUp ?? undefined;
    if ("onUpOutside" in options) this._onUpOutside = options.onUpOutside ?? undefined;
    if ("onPointerEnter" in options) this._onPointerEnter = options.onPointerEnter ?? undefined;
    if ("onPointerLeave" in options) this._onPointerLeave = options.onPointerLeave ?? undefined;
    if ("onPointerMove" in options) this._onPointerMove = options.onPointerMove ?? undefined;
    if ("onPointerOver" in options) this._onPointerOver = options.onPointerOver ?? undefined;
    if ("onPointerOut" in options) this._onPointerOut = options.onPointerOut ?? undefined;
    if ("onPointerCancel" in options) this._onPointerCancel = options.onPointerCancel ?? undefined;
    if ("onRightClick" in options) this._onRightClick = options.onRightClick ?? undefined;

    this.measure();
    this.updatePointerHandlers();
    this.refresh();
    return this
  }
}