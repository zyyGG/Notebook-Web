import Root from "../components/v2/Root"
import Button from "../components/v2/Button"
import Container from "../components/v2/Container"
import gsap from "gsap"


export default async function initGame(canvas: HTMLDivElement) {
  const uiRoot = new Root({
    background: "#3e3e3e",
    resizeTo: canvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  }, canvas);

  const button = new Button()
  uiRoot
    .add(
      new Container()
        .options({
          width: uiRoot.canvas.clientWidth,
          height: uiRoot.canvas.clientHeight,
          padding: [16, 16],
        })
        .add(
          button
        )
    );

  const moveParams = {
    x: 500,
  }

  gsap.to(moveParams, {
    x: 0,
    duration: 1,
    ease: "bounce.out",
    onUpdate: () => {
      button.options({
        x: moveParams.x,
      })
    }
  })
}