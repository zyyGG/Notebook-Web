import * as PIXI from "pixi.js";

export default abstract class BaseContainer extends PIXI.Container {
  _x: number = 0;
  _y: number = 0;
  _width: number = 0;
  _height: number = 0;
  _children: PIXI.Container[] = [];
  _background: string | number = "transparent";
  graphics!: PIXI.Graphics;

  #parentContainer?: BaseContainer;
  #childOrigins = new WeakMap<PIXI.Container, { x: number; y: number }>();

  setParent(parent: BaseContainer) {
    this.#parentContainer = parent;
    return this;
  }

  layout(parentX = 0, parentY = 0) {
    this.position.set(parentX + this._x, parentY + this._y);
    this.layoutChildren();
  }

  protected layoutChildren() {}

  protected layoutChild(child: PIXI.Container, x: number, y: number) {
    if (child instanceof BaseContainer) {
      child.layout(x, y);
      return;
    }

    const origin = this.#childOrigins.get(child) ?? { x: child.x, y: child.y };
    child.position.set(x + origin.x, y + origin.y);
  }

  protected getChildOrigin(child: PIXI.Container) {
    if (child instanceof BaseContainer) {
      return { x: child._x, y: child._y };
    }
    return this.#childOrigins.get(child) ?? { x: child.x, y: child.y };
  }

  protected onChildrenChanged() {}

  protected drawBackground(radius = 0) {
    if (this.graphics?.parent === this) {
      this.removeChild(this.graphics);
    }

    const graphics = new PIXI.Graphics();
    this.graphics = graphics;
    if (radius > 0) {
      graphics.roundRect(0, 0, this._width, this._height, radius);
    } else {
      graphics.rect(0, 0, this._width, this._height);
    }
    graphics.fill(this._background);
    this.addChildAt(graphics, 0);
    return graphics;
  }

  add(...children: PIXI.Container[]): this {
    children.forEach((child) => {
      if (this._children.includes(child)) return;
      if (child instanceof BaseContainer) {
        child.setParent(this);
      } else {
        this.#childOrigins.set(child, { x: child.x, y: child.y });
      }
      this._children.push(child);
      this.addChild(child);
    });
    this.onChildrenChanged();
    this.refresh();
    return this;
  }

  drawTree() {
    this.draw();
    this._children.forEach((child) => {
      if (child instanceof BaseContainer) child.drawTree();
    });
  }

  refresh() {
    let root: BaseContainer = this;
    while (root.#parentContainer) {
      const parent = root.#parentContainer;
      parent.onChildrenChanged();
      root = parent;
    }
    root.layout();
    root.drawTree();
    return this;
  }

  abstract draw(): void
}