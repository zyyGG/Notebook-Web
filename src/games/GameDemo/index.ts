import { Application, Text, Graphics, Color, Container } from "pixi.js";
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
  const center = {
    x: app.screen.width / 2,
    y: app.screen.height / 2,
  };

  // const text = new Text("Hello wolrd!")

  const rect = new Graphics();
  rect.rect(0, 0, app.screen.width, app.screen.height);
  rect.stroke({ color: 0xffffff, width: 2 });
  app.stage.addChild(rect);

  const menuItems = []
  for(let i = 0; i < 5; i++) {
    const menuItem = new MenuItem({
      text: `菜单项8888${i + 1}`,
      onSelect: () => { console.log(`点击了菜单项${i + 1}`) }
    });
    menuItems.push(menuItem);
  }

  const menu = new Menu({
    menuItems: menuItems,
    buttonOptions: {
      text: "打开菜单",
      background: 0x333333,
      onClick: () => {
        menu.setMenuVisible(!menu.menuVisible);
      },
      pivotPosition: "leftTop",
    },
  })
  app.stage.addChild(menu);
  

  const button = new Button({
    text: "按钮888",
    round: 8,
  })
  app.stage.addChild(button);
  button.position.set(100, 200);
  // menu.position.set(menu.buttonContainer.width / 2, menu.buttonContainer.height / 2);
  // menu.position.set(100, 100);
  // menu.menuPosition = "buttom_right";

  

}
