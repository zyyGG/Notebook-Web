import { describe, expect, it, vi } from "vitest";
import * as PIXI from "pixi.js";
import Dialog from "../v2/dialog";

function createStage(width = 800, height = 600) {
  const stage = new PIXI.Container();
  const gameLayer = new PIXI.Container();
  gameLayer.addChild(new PIXI.Graphics().rect(0, 0, width, height).fill(0x101820));
  gameLayer.position.set(20, 30);
  stage.addChild(gameLayer);
  return { stage, gameLayer };
}

describe("v2 Dialog", () => {
  it("uses the Container API and keeps the backdrop outside content layout", () => {
    const { stage, gameLayer } = createStage();
    const dialog = new Dialog().options({ width: 360, height: 200 }).add(
      new PIXI.Text({ text: "暂停", style: { fontSize: 20 } }),
    );
    stage.addChild(dialog);
    const contentChildren = [...dialog._children];

    dialog.open();

    const backdrop = stage.children.find((child) => child instanceof PIXI.Graphics) as PIXI.Graphics;
    expect(dialog.parent).toBe(stage);
    expect(dialog.visible).toBe(true);
    expect(dialog._children).toEqual(contentChildren);
    expect(backdrop.eventMode).toBe("static");
    expect(backdrop.hitArea).toMatchObject({ width: 820, height: 630 });
    expect(gameLayer.position).toMatchObject({ x: 20, y: 30 });

    dialog.close(false);
    expect(dialog.visible).toBe(false);
    expect(dialog.parent).toBe(stage);
    expect(dialog._children).toEqual(contentChildren);
    dialog.destroy({ children: true });
  });

  it("blocks backdrop taps without dismissing unless configured", () => {
    const { stage } = createStage(640, 480);
    const dialog = new Dialog().options({ width: 320, height: 180 });
    stage.addChild(dialog);
    dialog.open();
    const backdrop = stage.children.find((child) => child instanceof PIXI.Graphics) as PIXI.Graphics;
    const event = { stopPropagation: vi.fn() } as unknown as PIXI.FederatedPointerEvent;

    backdrop.emit("pointertap", event);

    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(dialog.visible).toBe(true);
    dialog.close(false);
    dialog.destroy({ children: true });
  });

  it("closes on backdrop taps when requested", async () => {
    const { stage } = createStage(640, 480);
    const dialog = new Dialog().options({ width: 320, height: 180, dismissOnBackdropClick: true });
    stage.addChild(dialog);
    dialog.open();
    const backdrop = stage.children.find((child) => child instanceof PIXI.Graphics) as PIXI.Graphics;

    backdrop.emit("pointertap", { stopPropagation() {} } as PIXI.FederatedPointerEvent);
    await new Promise((resolve) => setTimeout(resolve, 220));

    expect(dialog.visible).toBe(false);
    expect(backdrop.parent).toBeNull();
    dialog.destroy({ children: true });
  });
});