import * as PIXI from "pixi.js";
import Padding, { type PaddingParams } from "./Padding";
import BaseContainer from "./BaseContainer";
import { getIcon } from "../../../utils";

export type Options = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  padding?: PaddingParams;
  name?: string;
};

export default class Sprite extends BaseContainer {
  _width = 32;
  _height = 32;
  _name: string | undefined = undefined;
  _color:string = "white"
  private sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);

  constructor(name?: string) {
    super();
    this._name = name;
    // 加载图片
    this.addChild(this.sprite)
    this.loadImage();
  }

  private async loadImage(): Promise<void> {
    if(this._name == undefined){
      this.refresh
      return;
    }
    const source = new globalThis.Image()
    source.src = getIcon({name: this._name, width: 32, color: this._color})
    await source.decode()
    // await PIXI.loadSVGImage(source, getIcon({name: "option", width: 32, color: "white"}), false)
    this.sprite.texture = PIXI.Texture.from(source)
    this.refresh()
  }

  draw() {
    this.sprite.width = this._width;
    this.sprite.height = this._height;
  }

  options(options: Options) {
    this._x = options.x ?? this._x;
    this._y = options.y ?? this._y;
    this._width = options.width ?? this._width;
    this._height = options.height ?? this._height;
    this._name = options.name;
    this._color = options.color ?? "white"
    this.loadImage()
    this.refresh();
    return this;
  }
}
