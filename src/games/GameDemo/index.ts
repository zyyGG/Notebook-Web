import Root from "../components/v2/Root"
import Button from "../components/v2/Button"
import Container from "../components/v2/Container"
import HContainer from "../components/v2/HContainer";
import Text from "../components/v2/Text";
import VContainer from "../components/v2/VContainer";
import Toast from "../components/v2/Toast";
import Dialog from "../components/v2/dialog";


export default async function initGame(canvas: HTMLDivElement) {
  const uiRoot = new Root({
    background: "#3e3e3e",
    resizeTo: canvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  }, canvas);

  uiRoot
    .add(
      new VContainer()
        .add(
          new HContainer()
          .options({align: 'center', background: '#ff0000'})
          .add(new Button().add(new Text().options({text: "按钮1"})))
          .add(new Button().add(new Text().options({text: "按钮2"})))
          .add(new Button().add(new Text().options({text: "按钮3"})))
          .add(new Button().options({height: 200}).add(new Text().options({text: "按钮4", fontSize: 55,})))
          .add(new Button().options({}))
          .add(new Button().options({}))
          .add(new Button().options({}))
        )
        .add(
          new VContainer()
          .add(new Text().options({text: "文本1"}))
          .add(new Text().options({text: "文本2"}))
          .add(new Text().options({text: "文本3"}))
          .add(new Text().options({text: "文本4"}))
          .add(
            new Button()
            .options({
              onClick: (event) => Toast.error("游戏初始化完成")
            })
            .add(new Text().options({text: "Toast"}))
          )
          .add(
            new Button()
            .options({
              onClick: () => {
                const dialog = new Dialog()
                  .options({ width: 500, height: 220, dismissOnBackdropClick: true })
                  .add(
                    new VContainer()
                      .options({ width: 452, height: 172, padding: 0, spacing: 12, align: "center", background: "transparent" })
                      .add(new Text().options({ text: "对话框", fontSize: 22, textWeight: "bold" }))
                      .add(new Text().options({ text: "这是一个对话框", fontSize: 16 }))
                  );
                uiRoot.add(dialog);
                dialog.open();
              }
            })
            .add(new Text().options({text: "Dialog"}))
          )
          
        )
    );
    
    
  // const moveParams = {
  //   x: 500,
  // }

  // gsap.to(moveParams, {
  //   x: 0,
  //   duration: 1,
  //   ease: "bounce.out",
  //   onUpdate: () => {
  //     button.options({
  //       x: moveParams.x,
  //     })
  //   }
  // })
}