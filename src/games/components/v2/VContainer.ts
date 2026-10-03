import BaseContainer from './BaseContainer';
import Container, { Options as ContainerOptions } from './Container';

export type Options = ContainerOptions & {
  spacing?: number;
  align?: 'start' | 'center' | 'end';
}

export default class VContainer extends Container {
  _spacing: number = 12;
  _align: 'start' | 'center' | 'end' = 'start';
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
    let y = this._padding.top;
    this._children.forEach((child, index) => {
      const origin = this.getChildOrigin(child);
      this.layoutChild(child, this._padding.left, y);
      y += origin.y + (child instanceof BaseContainer ? child._height : child.height);
      if (index < this._children.length - 1) {
        y += this._spacing;
      }

      if (this._align === 'center') {
        const containerWidth = this._width - this._padding.left - this._padding.right;
        const childWidth = child instanceof BaseContainer ? child._width : child.width;
        const offsetX = (containerWidth - childWidth) / 2;
        child.position.x = this._padding.left + origin.x + offsetX;
      } else if (this._align === 'end') {
        const containerWidth = this._width - this._padding.left - this._padding.right;
        const childWidth = child instanceof BaseContainer ? child._width : child.width;
        const offsetX = containerWidth - childWidth;
        child.position.x = this._padding.left + origin.x + offsetX;
      } else if (this._align === 'start') {
        child.position.x = this._padding.left + origin.x;
      }
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