import * as PIXI from "pixi.js";
import Container from "./Container";
import Toast from "./Toast";

export type Options = {};

export default class Root {
  public app?: PIXI.Application;
  private pending: Array<() => void> = []; // 待初始化完成的操作队列

  x: number = 0;
  y: number = 0;

  ticker?: PIXI.Ticker;

  constructor(
    public appOptions: Partial<PIXI.ApplicationOptions>,
    public canvas: HTMLDivElement,
  ) {
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this.#bootstrap();
  }

  // 只会执行一次，初始化 PIXI.Application
  async #bootstrap() {
    const app = new PIXI.Application();
    await app.init(this.appOptions);
    this.app = app;
    this.canvas.appendChild(app.canvas); // 把 PIXI 的 canvas 挂到传入的 div 上
    Toast.mount(app);
    this.pending.forEach((fn) => fn());
    this.pending = [];
  }

  // 在 app 初始化完成后执行 fn，如果 app 还没初始化完成，就把 fn 放到 pending 队列里
  #run(fn: () => void) {
    if (this.app) fn();
    else this.pending.push(fn);
  }

  options(options: Options) {}

  add(...containers: Container[]) {
    if(containers.length === 0) return this;
    this.#run(() => {
      containers.forEach((container) => this.app?.stage.addChild(container));
      containers.forEach((container) => container.layout());
      containers.forEach((container) => container.drawTree());
    });
    return this;
  }
}
