import { Assets, NineSliceSprite, Text } from "pixi.js";

export default function Button(title: string, onClick: () => void) {
  // const fontSize = 16;
  const paddingX = 12;
  const paddingY = 8;
  const width = 120
  const text = new Text({
    text: title,
    style: {
      fill: "#3e3e3e",
      fontSize: 16,
    }
  })
  const button = new NineSliceSprite({
    texture: Assets.get("block"),
    leftWidth: 4,
    topHeight: 4,
    rightWidth: 4,
    bottomHeight: 4,
    width: Math.max(text.width + paddingX * 2, width),
    height: text.height + paddingY * 2,
  });
  text.position.set((button.width - text.width) / 2, (button.height - text.height) / 2);
  button.addChild(text);
  button.interactive = true;
  // button.buttonMode = true;
  button.on("pointerdown", onClick);
  return button;
}