import { Application, Text, Graphics, Color, Container } from "pixi.js";
import * as PIXI from "pixi.js";
import Menu from "../components/Menu";
import MenuItem from "../components/MenuItem";
import Button from "../components/Button";
export default async function initGame(canvas: HTMLDivElement) {
  const app = new Application();
  await app.init({
    background: "#3e3e3e",
    resizeTo: canvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    // height: canvas.height,
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.appendChild(app.canvas);

  // const text = new Text("Hello wolrd!")

  const rect = new Graphics();
  rect.rect(0, 0, app.screen.width, app.screen.height);
  // rect.stroke({ color: 0xffffff, width: 2 });
  app.stage.addChild(rect);

  const button = new Button({
    text: "按钮888",
    round: 8,
  })
  
  app.stage.addChild(button);
  button.position.set(100, 200);
}
