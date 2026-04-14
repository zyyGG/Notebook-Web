import { Container, Text, FederatedEvent, TextStyle } from "pixi.js";

type MenuItemOptions = {
  text?: string,
  textStyle?: TextStyle,
  onSelect?: (event: FederatedEvent) => void,
  onMoveIn?: (event: FederatedEvent) => void,
  onMoveOut?: (event: FederatedEvent) => void,
}

/**
 * 菜单项组件，包含一个文本和一个点击事件，鼠标移入移出时会有默认的hover效果
 * @extends Container
 * @param {MenuItemOptions} options - 菜单项选项
 * @param {string} [options.text="菜单项"] - 菜单项文本内容
 * @param {TextStyle} [options.textStyle] - 菜单项文本样式，具体参数参考pixi.js文档
 * @param {function} [options.onSelect] - 菜单项被点击时的回调函数，参数为事件对象
 * @param {function} [options.onMoveIn] - 鼠标移入菜单项时的回调函数，参数为事件对象
 * @param {function} [options.onMoveOut] - 鼠标移出菜单项时的回调函数，参数为事件对象
 * @example
 * import Menu from "./Menu";
 * import MenuItem from "./MenuItem";
 * 
 * const menuItem = new MenuItem({
 *   text: "菜单项1",
 *   onSelect: (e) => { console.log("点击了菜单项1") },
 * })
 * 
 * const menu = new Menu({
 *  menuItems: [menuItem]
 * })
 */
export default class MenuItem extends Container {
  constructor(options?: MenuItemOptions) {
    super();
    options = options || {};
    const text = options.text || "菜单项";
    const textStyle = options.textStyle || {
      fill: 0xffffff,
      fontSize: 18
    }
    const onSelect = options.onSelect || undefined;
    const onMoveIn = options.onMoveIn || undefined;
    const onMoveOut = options.onMoveOut || undefined;


    const textSprite = new Text({
      text,
      style: textStyle
    })
    this.addChild(textSprite);

    // 添加hover效果
    this.on("pointerover", (e) => {
      if(onMoveIn) {
        onMoveIn(e);
      } else {
        e.currentTarget.alpha = 0.7;
      }
    })

    this.on("pointerout", (e) => {
      if(onMoveOut) {
        onMoveOut(e);
      } else {
        e.currentTarget.alpha = 1;
      }
    })

    if(onSelect) {
      this.interactive = true;
      this.on("pointerdown", onSelect);
    }
  }
}