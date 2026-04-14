import { Container, Graphics, ObservablePoint } from "pixi.js";
import Button from "./Button"
import type { ButtonOptions } from "./Button";
import MenuItem from "./MenuItem";

type menuPosition = "buttom_left" | "buttom_right" | "top_left" | "top_right" | "left_top" | "left_buttom" | "right_top" | "right_buttom";

export type MenuOptions = {
  // menuPosition?: "leftTop" | "top" | "rightTop" | "right" | "rightBottom" | "bottom" | "leftBottom" | "left" | "center",
  menuPosition?: menuPosition,
  buttonOptions?: ButtonOptions,
  menuItems?: MenuItem[],
}

/**
 * 菜单组件，包含一个按钮和一个菜单列表，点击按钮可以切换菜单列表的显示状态
 * @extends Container
 * @param {MenuOptions} options - 菜单选项
 * @param {string} [options.menuPosition="buttom_left"] - 菜单的位置，可选值为
 * "buttom_left" | "buttom_right" | "top_left" | "top_right" | "left_top" | "left_buttom" | "right_top" | "right_buttom"
 * 例如buttom_left表示菜单在按钮的buttom，并且菜单left对齐
 * @param {ButtonOptions} [options.buttonOptions] - 按钮选项，具体参数参考Button组件
 * @param {MenuItem[]} [options.menuItems] - 菜单项列表，具体参数参考MenuItem组件
 * @example
 * import Menu from "./Menu";
 * import MenuItem from "./MenuItem";
 * 
 * const menuItem = new MenuItem({
 *   text: "菜单项1",
 *   onSelect: () => { console.log("点击了菜单项1") }
 * })
 * 
 * const menu = new Menu({
 *  menuItems: [menuItem],
 * })
 * 
 */
export default class Menu extends Container {
  menuContainer: Container;
  buttonContainer: Button;

  private _menuPosition: menuPosition;
  private _menuWidth: number = 0;
  private _menuHeight: number = 0;

  /**
   * @readonly
   */
  get menuVisible(): boolean {
    return this.menuContainer.visible;
  }

  get menuPosition(): menuPosition {
    return this._menuPosition;
  }

  set menuPosition(value: menuPosition) {
    this._menuPosition = value;
    this._updateLayout();
  }

  constructor(options?: MenuOptions) {
    super();
    options = options || {};
    this._menuPosition = options.menuPosition || "buttom_left";
    const buttonOptions = options.buttonOptions ||  {
      text: "菜单",
      background: 0x333333,
      onClick: () => { 
        this.setMenuVisible(!this.menuVisible);
      },
      pivotPosition: "center",
    };
    const menuItems = options.menuItems || [];
    

    // 设置开启按钮
    const button = new Button(buttonOptions);
    this.addChild(button);
    this.buttonContainer = button;

    // 菜单
    const menuContainer = new Container();
    menuContainer.visible = false;
    this.addChild(menuContainer);
    this.menuContainer = menuContainer;

    if(options.menuItems) {
      const maxWidth = Math.max(...options.menuItems.map(item => item.width), 80);
      const menuItemHeight = 18;
      const menuItemMargin = 8;
      const menuContainerPadding = 12;
      const menuContainerbg = new Graphics();
      this._menuWidth = maxWidth + menuContainerPadding * 2;
      this._menuHeight = menuItems.length * (menuItemHeight + menuItemMargin * 2) + menuContainerPadding;
      menuContainerbg.rect(0, 0, this._menuWidth, this._menuHeight);
      menuContainerbg.fill(0x333333);
      menuContainer.addChild(menuContainerbg);

      options.menuItems.forEach((menuItem, index) => {
        menuContainer.addChild(menuItem);
        menuItem.position.set(
          menuContainerPadding,
          menuContainerPadding + (index * (menuItem.height + menuItemMargin * 2))
        )
      });

      this._updateLayout();
    }
  }

  override _onUpdate(point?: ObservablePoint): void {
    super._onUpdate(point);
    if (point === this.position) {
      this._updateLayout();
    }
  }

  private _updateLayout(): void {
    if (!this.buttonContainer || !this.menuContainer) return;
    const bw = this.buttonContainer.width;
    const bh = this.buttonContainer.height;
    const mw = this._menuWidth;
    const mh = this._menuHeight;
    switch (this._menuPosition) {
      case "buttom_left":
        this.menuContainer.position.set(0, bh);
        break;
      case "buttom_right":
        this.menuContainer.position.set(bw - mw, bh);
        break;
      case "top_left":
        this.menuContainer.position.set(0, -mh);
        break;
      case "top_right":
        this.menuContainer.position.set(bw - mw, -mh);
        break;
      case "left_top":
        this.menuContainer.position.set(-mw, 0);
        break;
      case "left_buttom":
        this.menuContainer.position.set(-mw, bh - mh);
        break;
      case "right_top":
        this.menuContainer.position.set(bw, 0);
        break;
      case "right_buttom":
        this.menuContainer.position.set(bw, 0 - mh + bh);
        break;
    }
  }

  setMenuVisible(visible: boolean) {
    this.menuContainer.visible = visible;
  }

}