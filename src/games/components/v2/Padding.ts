export type PaddingParams = number | Padding | [number] | [number, number] | [number, number, number, number];

export default class Padding {
  constructor(
    public l: number = 0,
    public r: number = 0,
    public t: number = 0,
    public b: number = 0,
  ) {}

  set(a: PaddingParams) : Padding
  set(a: number, b: number) : Padding
  set(a: number, b: number, c: number, d: number) : Padding
  set(a: number | Padding | number[], b?: number, c?: number, d?: number): Padding {
    if (typeof a === "number") {
      if (b === undefined && c === undefined && d === undefined) {
        this.t = a;
        this.r = a;
        this.b = a;
        this.l = a;
        return this;
      } else if (b !== undefined && c === undefined && d === undefined) {
        this.t = a;
        this.r = b;
        this.b = a;
        this.l = b;
        return this;
      } else if (b !== undefined && c !== undefined && d !== undefined) {
        this.t = a;
        this.r = b;
        this.b = c;
        this.l = d;
        return this;
      } else {
        throw new Error("Padding 的参数数量应该是 1、2 或 4 个");
      }
    } else if(a instanceof Padding) {
      this.t = a.t;
      this.r = a.r;
      this.b = a.b;
      this.l = a.l;
      return this;
    } else if(a instanceof Array) {
      if(a.length === 1) {
        this.t = a[0];
        this.r = a[0];
        this.b = a[0];
        this.l = a[0];
        return this;
      } else if(a.length === 2) {
        this.t = a[0];
        this.r = a[1];
        this.b = a[0];
        this.l = a[1];
        return this;
      } else if(a.length === 4) {
        this.t = a[0];
        this.r = a[1];
        this.b = a[2];
        this.l = a[3];
        return this;
      } else {
        throw new Error("Padding 的参数数量应该是 1、2 或 4 个");
      }
    } else {
      throw new Error("Padding 的参数类型应该是 number 或 Padding");
    }
  }

  get top() { return this.t; }
  get right() { return this.r; }
  get bottom() { return this.b; }
  get left() { return this.l; }
  set top(value: number) { this.t = value; }
  set right(value: number) { this.r = value; }
  set bottom(value: number) { this.b = value; }
  set left(value: number) { this.l = value; }
}

