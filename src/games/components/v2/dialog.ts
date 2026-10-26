import * as PIXI from "pixi.js";
import gsap from "gsap";
import Container, { type Options as ContainerOptions } from "./Container";

export type DialogOptions = ContainerOptions & {
  dismissOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
};

const PANEL_COLOR = 0x24323b;

export default class Dialog extends Container {
  static activeDialog?: Dialog;

  private backdrop?: PIXI.Graphics;
  private overlayHost?: PIXI.Container;
  private dismissOnBackdropClick = false;
  private closeOnEscape = true;
  private isOpen = false;
  private isClosing = false;

  private readonly handleBackdropTap = (event: PIXI.FederatedPointerEvent) => {
    event.stopPropagation();
    if (this.dismissOnBackdropClick) this.close();
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.closeOnEscape || event.key !== "Escape" || Dialog.activeDialog !== this) return;
    event.preventDefault();
    this.close();
  };

  private readonly handleResize = () => this.layoutOverlay();

  constructor(options: DialogOptions = {}) {
    super();
    this.zIndex = 9000;
    this._background = PANEL_COLOR;
    this._width = 400;
    this._height = 240;
    this._fixedWidth = 400;
    this._fixedHeight = 240;
    this._padding.set(24);
    this.visible = false;
    this.options(options);
  }

  options(options: DialogOptions): this {
    if (options.dismissOnBackdropClick !== undefined) {
      this.dismissOnBackdropClick = options.dismissOnBackdropClick;
    }
    if (options.closeOnEscape !== undefined) {
      this.closeOnEscape = options.closeOnEscape;
    }

    const { dismissOnBackdropClick: _dismissOnBackdropClick, closeOnEscape: _closeOnEscape, ...containerOptions } = options;
    return super.options(containerOptions);
  }

  open(): this {
    if (this.isOpen || this.isClosing) return this;
    if (!this.parent) {
      throw new Error("Add Dialog to a Root/container before calling open().");
    }

    Dialog.activeDialog?.close(false);
    Dialog.activeDialog = this;
    this.isOpen = true;
    this.isClosing = false;

    const host = this.parent;
    const bounds = host.getLocalBounds();
    this._x = bounds.x + (bounds.width - this._width) / 2;
    this._y = bounds.y + (bounds.height - this._height) / 2;
    this.position.set(this._x, this._y);
    this.visible = true;

    this.backdrop = new PIXI.Graphics();
    this.backdrop.zIndex = this.zIndex - 1;
    this.backdrop.eventMode = "static";
    this.backdrop.on("pointertap", this.handleBackdropTap);
    this.overlayHost = host;
    host.sortableChildren = true;
    host.addChildAt(this.backdrop, host.getChildIndex(this));
    this.layoutOverlay();

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("resize", this.handleResize);
    this.alpha = 0;
    this.scale.set(0.96);
    gsap.to(this, { alpha: 1, duration: 0.18, ease: "power1.out", overwrite: "auto" });
    gsap.to(this.scale, { x: 1, y: 1, duration: 0.2, ease: "back.out(1.4)", overwrite: "auto" });
    gsap.fromTo(this.backdrop, { alpha: 0 }, { alpha: 1, duration: 0.18, ease: "power1.out", overwrite: "auto" });
    return this;
  }

  close(animate = true): this {
    if (!this.isOpen || this.isClosing) return this;
    this.isClosing = true;
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);

    const finish = () => {
      this.backdrop?.parent?.removeChild(this.backdrop);
      this.backdrop?.destroy();
      this.backdrop = undefined;
      this.overlayHost = undefined;
      this.visible = false;
      this.alpha = 1;
      this.scale.set(1);
      this.isOpen = false;
      this.isClosing = false;
      if (Dialog.activeDialog === this) Dialog.activeDialog = undefined;
    };

    if (!animate) {
      gsap.killTweensOf(this);
      gsap.killTweensOf(this.scale);
      if (this.backdrop) gsap.killTweensOf(this.backdrop);
      finish();
      return this;
    }

    gsap.to(this, {
      alpha: 0,
      scaleX: 0.97,
      scaleY: 0.97,
      duration: 0.14,
      ease: "power1.in",
      overwrite: "auto",
      onComplete: finish,
    });
    if (this.backdrop) {
      gsap.to(this.backdrop, { alpha: 0, duration: 0.14, ease: "power1.in", overwrite: "auto" });
    }
    return this;
  }

  destroy(options?: PIXI.DestroyOptions) {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("resize", this.handleResize);
    gsap.killTweensOf(this);
    gsap.killTweensOf(this.scale);
    if (this.backdrop) {
      gsap.killTweensOf(this.backdrop);
      this.backdrop.parent?.removeChild(this.backdrop);
      this.backdrop.destroy();
      this.backdrop = undefined;
    }
    if (Dialog.activeDialog === this) Dialog.activeDialog = undefined;
    super.destroy(options);
  }

  private layoutOverlay() {
    if (!this.backdrop || !this.overlayHost) return;
    const bounds = this.overlayHost.getLocalBounds();
    this.backdrop.clear().rect(bounds.x, bounds.y, bounds.width, bounds.height).fill({ color: 0x000000, alpha: 0.58 });
    this.backdrop.hitArea = new PIXI.Rectangle(bounds.x, bounds.y, bounds.width, bounds.height);
    this._x = bounds.x + (bounds.width - this._width) / 2;
    this._y = bounds.y + (bounds.height - this._height) / 2;
    this.position.set(this._x, this._y);
  }
}