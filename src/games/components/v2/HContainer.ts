import BaseContainer from './BaseContainer';
import Container, { Options as ContainerOptions } from './Container';

export type Options = ContainerOptions & {
  spacing?: number;
  align?: "start" | "center" | "end" | "space-between" | "space-around";
}

export default class HContainer extends Container {
  _spacing: number = 12;
  _align: NonNullable<Options["align"]> = "start";
  constructor() {
    super();
  }

  protected getContentSize() {
    let width = 0;
    let height = 0;
    let x = 0;
    this._children.forEach((child, index) => {
      const origin = this.getChildOrigin(child);
      const childWidth = child instanceof BaseContainer ? child._width : child.width;
      const childHeight = child instanceof BaseContainer ? child._height : child.height;
      width = Math.max(width, x + origin.x + childWidth);
      height = Math.max(height, origin.y + childHeight);
      x += origin.x + childWidth;
      if (index < this._children.length - 1) x += this._spacing;
    });
    return { width, height };
  }

  protected layoutChildren() {
    const childSizes = this._children.map((child) => ({
      origin: this.getChildOrigin(child),
      width: child instanceof BaseContainer ? child._width : child.width,
      height: child instanceof BaseContainer ? child._height : child.height,
    }));
    const innerWidth = this._width - this._padding.left - this._padding.right;
    const contentWidth = childSizes.reduce(
      (width, child) => width + child.origin.x + child.width,
      this._spacing * Math.max(0, childSizes.length - 1),
    );
    const freeSpace = Math.max(0, innerWidth - contentWidth);
    const extraGap =
      this._align === "space-between" && childSizes.length > 1
        ? freeSpace / (childSizes.length - 1)
        : this._align === "space-around" && childSizes.length > 0
          ? freeSpace / childSizes.length
          : 0;
    let x = this._padding.left;
    if (this._align === "center") x += freeSpace / 2;
    if (this._align === "end") x += freeSpace;
    if (this._align === "space-around" && childSizes.length > 0) {
      x += extraGap / 2;
    }

    this._children.forEach((child, index) => {
      const { origin, width: childWidth } = childSizes[index];
      this.layoutChild(child, x, this._padding.top);
      x += origin.x + childWidth;
      if (index < childSizes.length - 1) x += this._spacing + extraGap;
    });
  }

  options(options: Options) {
    if (options.spacing !== undefined) {
      this._spacing = options.spacing;
    }
    if (options.align !== undefined) {
      this._align = options.align;
    }
    return super.options(options);
  }
}