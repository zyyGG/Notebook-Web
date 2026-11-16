import BaseContainer from './BaseContainer';
import Container, { Options as ContainerOptions } from './Container';

export type Options = ContainerOptions & {
  spacing?: number;
  align?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
}

export default class VContainer extends Container {
  _spacing: number = 12;
  _align: NonNullable<Options["align"]> = 'start';
  constructor() {
    super();
  }

  protected getContentSize() {
    let width = 0;
    let height = 0;
    let y = 0;
    this._children.forEach((child, index) => {
      const origin = this.getChildOrigin(child);
      const childWidth = child instanceof BaseContainer ? child._width : child.width;
      const childHeight = child instanceof BaseContainer ? child._height : child.height;
      width = Math.max(width, origin.x + childWidth);
      height = Math.max(height, y + origin.y + childHeight);
      y += origin.y + childHeight;
      if (index < this._children.length - 1) y += this._spacing;
    });
    return { width, height };
  }

  protected layoutChildren() {
    const childSizes = this._children.map((child) => ({
      origin: this.getChildOrigin(child),
      width: child instanceof BaseContainer ? child._width : child.width,
      height: child instanceof BaseContainer ? child._height : child.height,
    }));
    const innerHeight = this._height - this._padding.top - this._padding.bottom;
    const contentHeight = childSizes.reduce(
      (height, child) => height + child.origin.y + child.height,
      this._spacing * Math.max(0, childSizes.length - 1),
    );
    const freeSpace = Math.max(0, innerHeight - contentHeight);
    const extraGap =
      this._align === 'space-between' && childSizes.length > 1
        ? freeSpace / (childSizes.length - 1)
        : this._align === 'space-around' && childSizes.length > 0
          ? freeSpace / childSizes.length
          : 0;
    let y = this._padding.top;
    if (this._align === 'center') y += freeSpace / 2;
    if (this._align === 'end') y += freeSpace;
    if (this._align === 'space-around' && childSizes.length > 0) {
      y += extraGap / 2;
    }

    this._children.forEach((child, index) => {
      const { origin, height: childHeight } = childSizes[index];
      this.layoutChild(child, this._padding.left, y);
      child.position.x = this._padding.left + origin.x;
      y += origin.y + childHeight;
      if (index < childSizes.length - 1) y += this._spacing + extraGap;
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