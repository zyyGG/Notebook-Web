import { Application, Text, Graphics, Color, Container } from "pixi.js";
import { Button } from "../components/index";
import { Dialog } from "../components/index";
export default async function initGame(canvas: HTMLCanvasElement) {
  const app = new Application();
  await app.init({
    background: "#3e3e3e",
    resizeTo: canvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.appendChild(app.canvas);

  const center = {
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  };

  // const text = new Text("Hello wolrd!")

  const rect = new Graphics();
  rect.rect(0, 0, app.screen.width, app.screen.height);
  rect.fill(0x550055);
  app.stage.addChild(rect);

  const headerContainer = new Container();
  const titleText = new Text("这是一个标题");
  headerContainer.addChild(titleText);

  const message = new Dialog({
    headerTitle: "标题",
  });
  app.stage.addChild(message);
  message.position.set(center.x, center.y);

  const button = new Button({
    text: "Hello world!",
    background: 0x007acc,
    round: 88,
    onDown: () => {
      message.visible = true;
    },
  });
  button.position.set(200, 50);

  app.stage.addChild(button);
}
