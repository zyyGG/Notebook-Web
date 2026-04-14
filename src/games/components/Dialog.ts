import {
  Sprite,
  Container,
  Text,
  Color,
  FederatedPointerEvent,
  Graphics,
} from "pixi.js";
import Button from "./Button";
type DialogOptions = {
  width?: number;
  height?: number;
  background?: Color | number;
  round?: number;
  header?: boolean;
  headerTitle?: string;
  headerContainer?: Container;
  footer?: boolean;
  footerContainer?: Container;
  contentContainer?: Container;
  onConfirm?: () => void;
  onCancel?: () => void;
  // modal?: boolean, // 遮罩
  // modalColor?: Color | number, // 遮罩颜色
  // modalOpacity?: number, // 遮罩透明度
};

/**
 * 对话框组件
 * @extends Container
 * @param options DialogOptions
 * @param options.width 对话框宽度，默认400
 * @param options.height 对话框高度，默认320
 * @param options.background 对话框背景颜色，默认0xffffff
 * @param options.round 对话框圆角，默认12
 * @param options.header 是否显示标题区域，默认true
 * @param options.headerTitle 标题文本，默认"标题"
 * @param options.headerContainer 自定义标题区域容器，默认undefined
 * @param options.footer 是否显示底部区域，默认true
 * @param options.footerContainer 自定义底部区域容器，默认undefined
 * @param options.contentContainer 自定义内容区域容器，默认undefined
 * @param options.onConfirm 点击确定按钮的回调函数
 * @param options.onCancel 点击取消按钮的回调函数

 * @returns Dialog
 * @example
 * // 创建一个对话框
 * const dialog =new Dialog({
 *  headerTitle: "确认框",
 *  contentContainer: new Container(),
 *  onConfirm: () => {
 *    console.log("点击了确定");
 *    dialog.visible = false; // 关闭dialog
 *  },
 * })
 */
export default class Dialog extends Container {
  label = "Dialog";
  constructor(options?: DialogOptions) {
    super();
    options = options || {};
    const width = options.width || 400;
    const height = options.height || 320;
    const background = options.background || 0xffffff;
    const round = options.round || 12;
    const header = options.header || true;
    const headerTitle = options.headerTitle || "标题";
    const headerContainer = options.headerContainer || undefined;
    const contentContainer = options.contentContainer || undefined;
    const footer = options.footer || true;
    const footerContainer = options.footerContainer || undefined;
    // const modal = options.modal || false;
    // const modalColor = options.modalColor || 0x000000;
    // const modalOpacity = options.modalOpacity || 0.3;

    if (typeof background == "number" || background instanceof Color) {
      const bg = new Graphics();
      if (round) {
        bg.roundRect(0, 0, width, height, round);
      } else {
        bg.rect(0, 0, width, height);
      }
      bg.fill(background);
      this.addChildAt(bg, 0);
    }

    // 标题区域
    if (header) {
      if (headerContainer) {
        this.addChild(headerContainer);
        headerContainer.position.set(0, 0);
      } else {
        const defaultHeaderContainer = new Container();
        this.addChild(defaultHeaderContainer);
        // 标题文本
        const text = new Text({
          text: headerTitle,
          style: { fill: 0x000000, fontSize: 16 },
        });
        text.position.set(12, 8);
        defaultHeaderContainer.addChild(text);

        // 关闭按钮
        const closeButton = new Text({
          text: "X",
          style: { fill: 0x000000, fontSize: 16 },
        });
        closeButton.position.set(width - 28, 8);
        defaultHeaderContainer.addChild(closeButton);
        closeButton.interactive = true;
        closeButton.on("pointerdown", () => {
          this.visible = false;
        });
      }
    }
    // 内容区域
    if (contentContainer) {
      this.addChild(contentContainer);
      contentContainer.position.set(0, header ? 40 : 0);
    } else {
      const defaultContentContainer = new Container();
      this.addChild(defaultContentContainer);
      defaultContentContainer.position.set(0, header ? 40 : 0);
    }
    // 底部区域
    if (footer) {
      if (footerContainer) {
        this.addChild(footerContainer);
        footerContainer.position.set(0, height - 40);
      } else {
        const defaultFooterContainer = new Container();
        this.addChild(defaultFooterContainer);
        defaultFooterContainer.position.set(0, height - 36);
        const confirmButton = new Button({
          text: "确定",
          textStyle: { fill: 0x3e3e3e, fontSize: 16 },
          // background: ,
          round: 8,
          pivotPosition: "leftTop",
          onClick: options.onConfirm,
        });
        confirmButton.position.set(12, 4);
        const cancelButton = new Button({
          text: "取消",
          textStyle: { fill: 0x3e3e3e, fontSize: 16 },
          // background: ,
          round: 8,
          pivotPosition: "rightTop",
          onClick: options.onCancel || (() => {
            this.visible = false;
          }),
        })
        cancelButton.position.set(width - cancelButton.width, 4);
        defaultFooterContainer.addChild(confirmButton);
        defaultFooterContainer.addChild(cancelButton);
      }
    }

    // 背景
    this.zIndex = 99999;

    this.pivot.set(this.width / 2, this.height / 2);
  }
}
