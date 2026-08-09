/**
 * 全局 canvas 2d-context mock
 *
 * happy-dom 不提供 CanvasRenderingContext2D / WebGLRenderingContext 全局类，
 * 但 PixiJS v8 的 BrowserAdapter 直接引用它们作为返回值。
 * 这里提供空的 stub class 和 getContext mock。
 *
 * 组件测试只走 Text 测量路径，不需要真实的渲染能力。
 */

// PixiJS v8 BrowserAdapter 需要这些全局类——提供空 stub
(globalThis as Record<string, unknown>).CanvasRenderingContext2D = class {};
(globalThis as Record<string, unknown>).WebGLRenderingContext = class {};

interface MockContext {
  canvas: HTMLCanvasElement;
  font: string;
  letterSpacing: string;
  textLetterSpacing: string;
  textAlign: string;
  textBaseline: string;
  measureText: (text: string) => {
    width: number;
    actualBoundingBoxLeft: number;
    actualBoundingBoxRight: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
  };
  fillText: () => void;
  strokeText: () => void;
  clearRect: () => void;
  save: () => void;
  restore: () => void;
  beginPath: () => void;
  closePath: () => void;
  moveTo: () => void;
  lineTo: () => void;
  rect: () => void;
  fill: () => void;
  stroke: () => void;
  clip: () => void;
  setTransform: () => void;
  translate: () => void;
  scale: () => void;
  rotate: () => void;
  drawImage: () => void;
  putImageData: () => void;
  getImageData: () => { data: Uint8ClampedArray; width: number; height: number };
  createLinearGradient: () => { addColorStop: () => void };
  createRadialGradient: () => { addColorStop: () => void };
  createPattern: () => object;
}

function createMock2dContext(canvas: HTMLCanvasElement): MockContext {
  return {
    canvas,
    font: '',
    letterSpacing: '',
    textLetterSpacing: '',
    textAlign: 'left',
    textBaseline: 'alphabetic',

    measureText(text: string) {
      const width = text.length * 10;
      return {
        width,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: width,
        actualBoundingBoxAscent: 12,
        actualBoundingBoxDescent: 3,
      };
    },

    // 以下为防御性 stub —— 组件测试不触发渲染路径
    fillText() {},
    strokeText() {},
    clearRect() {},
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    rect() {},
    fill() {},
    stroke() {},
    clip() {},
    setTransform() {},
    translate() {},
    scale() {},
    rotate() {},
    drawImage() {},
    putImageData() {},
    getImageData() {
      return { data: new Uint8ClampedArray(4), width: 1, height: 1 };
    },
    createLinearGradient() {
      return { addColorStop() {} };
    },
    createRadialGradient() {
      return { addColorStop() {} };
    },
    createPattern() {
      return {};
    },
  };
}

// 为 HTMLCanvasElement 原型注入 getContext mock
if (typeof HTMLCanvasElement !== 'undefined') {
  const proto = HTMLCanvasElement.prototype as unknown as Record<string, unknown>;
  const originalGetContext = proto.getContext as
    | ((type: string) => unknown)
    | undefined;

  proto.getContext = function (this: HTMLCanvasElement, type: string) {
    if (type === '2d') {
      const key = '__mock2d';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const self = this as any;
      if (!self[key]) {
        self[key] = createMock2dContext(this);
      }
      return self[key] as MockContext;
    }
    // webgl/webgpu 等：无需 mock，组件测试不会用到
    return typeof originalGetContext === 'function'
      ? originalGetContext.call(this, type)
      : null;
  };
}
