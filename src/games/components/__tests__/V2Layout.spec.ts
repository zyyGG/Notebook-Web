import { describe, expect, it, vi } from "vitest";
import * as PIXI from "pixi.js";
import { Sprite, Texture, type FederatedPointerEvent } from "pixi.js";
import Button from "../v2/Button";
import Container from "../v2/Container";
import HContainer from "../v2/HContainer";
import Text from "../v2/Text";
import Toast from "../v2/Toast";
import VContainer from "../v2/VContainer";

describe("v2 container layout", () => {
  it("resizes a Container after children are added or change size", () => {
    const container = new Container().options({ padding: [10, 20] });
    const child = new Button().options({ x: 10, y: 20, width: 120, height: 90 });

    container.add(child);

    expect(container._width).toBe(170);
    expect(container._height).toBe(130);

    child.options({ width: 200, height: 140 });

    expect(container._width).toBe(250);
    expect(container._height).toBe(180);
  });

  it("keeps explicitly configured Container dimensions fixed", () => {
    const container = new Container().options({ width: 150, height: 80 });

    container.add(new Button().options({ width: 220, height: 120 }));

    expect(container._width).toBe(150);
    expect(container._height).toBe(80);
  });

  it("uses Text x/y as container offsets and redraws its content at the origin", () => {
    const text = new Text().options({ x: 7, y: 9, text: "Label", fontSize: 24 });
    const button = new Button().options({ padding: [4, 6] }).add(text);

    expect(text.position.x).toBe(button._padding.left + 7);
    expect(text.position.y).toBe(button._padding.top + 9);
    expect(text.graphics.position.x).toBe(0);
    expect(text.graphics.position.y).toBe(0);
    expect(button._width).toBe(Math.max(64, Math.ceil(text._x + text._width + 6 + 6)));
    expect(button._height).toBe(Math.max(28, Math.ceil(text._y + text._height + 4 + 4)));

    const previousWidth = button._width;
    text.options({ text: "A much longer label" });

    expect(text.position.x).toBe(button._padding.left + 7);
    expect(text.position.y).toBe(button._padding.top + 9);
    expect(text.graphics.position.x).toBe(0);
    expect(text.graphics.position.y).toBe(0);
    expect(button._width).toBeGreaterThan(previousWidth);
  });

  it("centers button content in fixed bounds, including oversized text", () => {
    const text = new Text().options({ text: "Large label", fontSize: 64 });
    const button = new Button()
      .options({ width: 120, height: 48, padding: 0 })
      .add(text);

    expect(text.position.x).toBeCloseTo((button._width - text._width) / 2);
    expect(text.position.y).toBeCloseTo((button._height - text._height) / 2);
  });

  it("lays out nested children before drawing and includes spacing", () => {
    const first = new Button().options({ x: 2, y: 3 }).add(new Text().options({ text: "A" }));
    const second = new Button().options({ x: 4, y: 5 }).add(new Text().options({ text: "BB" }));
    const row = new HContainer()
      .options({ x: 5, y: 6, padding: [7, 11], spacing: 9 })
      .add(first, second);
    const root = new Container()
      .options({ x: 100, y: 50, padding: [13, 17] })
      .add(row);

    expect(row.position.x).toBe(17 + 5);
    expect(row.position.y).toBe(13 + 6);
    expect(first.position.x).toBe(11 + 2);
    expect(first.position.y).toBe(7 + 3);
    expect(second.position.x).toBe(11 + first._x + first._width + 9 + 4);
    expect(second.position.y).toBe(7 + 5);
    expect(root.position.x).toBe(100);
    expect(root.position.y).toBe(50);
  });

  it("distributes HContainer children with space-between", () => {
    const first = new Button().options({ width: 20, height: 10 });
    const second = new Button().options({ width: 20, height: 10 });
    const row = new HContainer()
      .options({ width: 220, height: 40, padding: [5, 10], spacing: 10, align: "space-between" })
      .add(first, second);

    expect(first.position.x).toBe(10);
    expect(second.position.x).toBe(190);
    expect(first.position.y).toBe(5);
    expect(second.position.y).toBe(5);
    expect(row._width).toBe(220);
  });

  it("distributes HContainer children with space-around", () => {
    const first = new Button().options({ width: 20, height: 10 });
    const second = new Button().options({ width: 20, height: 10 });
    const row = new HContainer()
      .options({ width: 220, height: 40, padding: [5, 10], spacing: 10, align: "space-around" })
      .add(first, second);

    expect(first.position.x).toBe(47.5);
    expect(second.position.x).toBe(152.5);
    expect(first.position.y).toBe(5);
    expect(second.position.y).toBe(5);
    expect(row._width).toBe(220);
  });

  it("aligns HContainer children horizontally for center and end", () => {
    const first = new Button().options({ width: 20, height: 10 });
    const second = new Button().options({ width: 20, height: 10 });
    const row = new HContainer()
      .options({ width: 220, height: 40, padding: [5, 10], spacing: 10, align: "center" })
      .add(first, second);

    expect(first.position.x).toBe(85);
    expect(second.position.x).toBe(115);
    expect(first.position.y).toBe(5);
    expect(second.position.y).toBe(5);

    row.options({ align: "end" });

    expect(first.position.x).toBe(160);
    expect(second.position.x).toBe(190);
    expect(first.position.y).toBe(5);
    expect(second.position.y).toBe(5);
  });

  it("aligns VContainer children vertically for center and end", () => {
    const first = new Button().options({ x: 3, y: 2, width: 40, height: 20 });
    const second = new Button().options({ x: 4, y: 5, width: 30, height: 10 });
    const column = new VContainer()
      .options({ width: 100, height: 160, padding: [7, 11], spacing: 9, align: "center" })
      .add(first, second);

    expect(first.position.y).toBe(59);
    expect(second.position.y).toBe(93);
    expect(first.position.x).toBe(11 + 3);
    expect(second.position.x).toBe(11 + 4);

    column.options({ align: "end" });

    expect(first.position.y).toBe(109);
    expect(second.position.y).toBe(143);
    expect(first.position.x).toBe(11 + 3);
    expect(second.position.x).toBe(11 + 4);
  });

  it("distributes VContainer children with space-between", () => {
    const first = new Button().options({ width: 20, height: 10 });
    const second = new Button().options({ width: 20, height: 10 });
    const column = new VContainer()
      .options({ width: 60, height: 120, padding: [10, 5], spacing: 4, align: "space-between" })
      .add(first, second);

    expect(first.position.y).toBe(10);
    expect(second.position.y).toBe(100);
    expect(first.position.x).toBe(5);
    expect(second.position.x).toBe(5);
    expect(column._height).toBe(120);
  });

  it("distributes VContainer children with space-around", () => {
    const first = new Button().options({ width: 20, height: 10 });
    const second = new Button().options({ width: 20, height: 10 });
    const column = new VContainer()
      .options({ width: 60, height: 120, padding: [10, 5], spacing: 4, align: "space-around" })
      .add(first, second);

    expect(first.position.y).toBe(29);
    expect(second.position.y).toBe(81);
    expect(first.position.x).toBe(5);
    expect(second.position.x).toBe(5);
    expect(column._height).toBe(120);
  });

  it("reflows siblings when a child changes and accepts zero coordinates", () => {
    const first = new Button().options({ x: 10 }).add(new Text().options({ text: "A" }));
    const second = new Button().add(new Text().options({ text: "B" }));
    const row = new HContainer().options({ spacing: 6 }).add(first, second);

    first.options({ x: 0 });
    first.add(new Text().options({ text: "Longer" }));

    expect(first.position.x).toBe(0);
    expect(second.position.x).toBe(first._width + 6);
    expect(first.parent).toBe(row);
  });

  it("keeps text and image children when button options redraw it", () => {
    const label = new Text().options({ text: "Icon label" });
    const image = new Sprite(Texture.WHITE);
    image.width = 20;
    image.height = 16;
    image.position.set(4, 5);

    const button = new Button().add(label, image);
    const widthWithChildren = button._width;
    button.options({ background: 0x123456 });

    expect(label.parent).toBe(button);
    expect(image.parent).toBe(button);
    expect(button._children).toEqual([label, image]);
    expect(button._width).toBe(widthWithChildren);
    expect(image.position.x).toBe(button._padding.left + 4);
    expect(image.position.y).toBe(button._padding.top + 5);
  });

  it("keeps explicitly configured dimensions while content changes", () => {
    const button = new Button().options({ width: 180, height: 56 });

    button.add(new Text().options({ text: "A much longer label" }));

    expect(button._width).toBe(180);
    expect(button._height).toBe(56);
  });

  it("reflows an HContainer when a nested button gains content", () => {
    const button = new Button();
    const nextButton = new Button().add(new Text().options({ text: "Next" }));
    const row = new HContainer().options({ spacing: 8 }).add(button, nextButton);
    const previousX = nextButton.position.x;
    const image = new Sprite(Texture.WHITE);
    image.width = 120;
    image.height = 24;

    button.add(image);

    expect(button._width).toBe(168);
    expect(nextButton.position.x).toBe(button._width + 8);
    expect(nextButton.position.x).toBeGreaterThan(previousX);
    expect(row._children).toEqual([button, nextButton]);
  });

  it("handles pointertap and allows clearing the click handler", () => {
    const onClick = vi.fn();
    const button = new Button().options({ onClick });
    const event = {} as FederatedPointerEvent;

    button.emit("pointertap", event);
    button.options({ onClick: null });
    button.emit("pointertap", event);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.eventMode).toBe("passive");
  });

  it("handles pointer hover, movement, and additional pointer events", () => {
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    const onPointerMove = vi.fn();
    const onPointerUpOutside = vi.fn();
    const onRightClick = vi.fn();
    const button = new Button().options({
      onPointerEnter,
      onPointerLeave,
      onPointerMove,
      onPointerUpOutside,
      onRightClick,
    });
    const event = {} as FederatedPointerEvent;

    button.emit("pointerenter", event);
    button.emit("pointerleave", event);
    button.emit("pointermove", event);
    button.emit("pointerupoutside", event);
    button.emit("rightclick", event);

    expect(onPointerEnter).toHaveBeenCalledWith(event);
    expect(onPointerLeave).toHaveBeenCalledWith(event);
    expect(onPointerMove).toHaveBeenCalledWith(event);
    expect(onPointerUpOutside).toHaveBeenCalledWith(event);
    expect(onRightClick).toHaveBeenCalledWith(event);
    expect(button.eventMode).toBe("static");

    button.options({ onPointerLeave: null, onPointerMove: null });
    button.emit("pointerleave", event);
    button.emit("pointermove", event);

    expect(onPointerLeave).toHaveBeenCalledTimes(1);
    expect(onPointerMove).toHaveBeenCalledTimes(1);
    expect(button.eventMode).toBe("static");

    button.options({
      onPointerEnter: null,
      onPointerUpOutside: null,
      onRightClick: null,
    });
    expect(button.eventMode).toBe("passive");
  });

  it("renders typed Toast messages at the top of its Pixi stage and expires them", () => {
    vi.useFakeTimers();
    const stage = new PIXI.Container();
    const app = { stage, screen: { width: 800, height: 600 } } as unknown as PIXI.Application;

    Toast.message("信息");
    Toast.mount(app);
    Toast.success("成功");
    Toast.error("错误");
    Toast.warn("警告");

    const layer = stage.children[0] as PIXI.Container;
    const views = layer.children as PIXI.Container[];
    expect(views).toHaveLength(4);
    expect(views.map((view) => (view.children[1] as PIXI.Text).text)).toEqual([
      "信息",
      "成功",
      "错误",
      "警告",
    ]);
    expect(views[0].y).toBeLessThan(24);
    expect(views[1].y).toBeGreaterThan(views[0].y);

    vi.advanceTimersByTime(3260);
    expect(layer.children).toHaveLength(0);
    vi.useRealTimers();
  });
});