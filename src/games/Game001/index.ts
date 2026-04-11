import type { Block, GameConfig, GameSource } from "./type";
import Button from "./Button";
import { Application, Assets, Container, Graphics, NineSliceSprite, Sprite, FederatedPointerEvent, Text} from "pixi.js";
import createNumber from "./Number";
import { loadConfig, saveConfig } from "../utils";

export default async function initGame(canvas: HTMLDivElement) {
  const app = new Application();
  await app.init({
    background: "#3e3e3e",
    resizeTo: canvas,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  canvas.appendChild(app.canvas);

  // 准备配置
  const gameConfig = loadConfig<GameConfig>("saolei", {
    rows: 16,
    cols: 16,
    bombs: 10,
    blockSize: 25
  });
  const gameSize = {
    get width() {
      return gameConfig.cols * gameConfig.blockSize;
    },
    get height() {
      return gameConfig.rows * gameConfig.blockSize;
    },
  };
  const gameControlSize = {
    // width: gameSize.width,
    height: 80,
  };
  // 计分板数据
  const gameSource : GameSource = {
    setSource: function(num: number) {
      const one = num % 10;
      const ten = Math.floor(num / 10) % 10;
      const hundred = Math.floor(num / 100) % 10;
      this.onePlace?.setNum(one);
      this.tenPlace?.setNum(ten);
      this.hundredPlace?.setNum(hundred);
      this.source = num;
    },
    onePlace: null,
    tenPlace: null,
    hundredPlace: null,
    source: 0,
  }

  // 方块组
  const blocks: Block[][] = [];


  // 准备资源
  await loadAssets();
  // 加载界面
  await loadTapBarUi();
  // 加载实际游戏场景
  await loadGame();

  // function loadConfig(gamename: string): GameConfig {
  //   const config = localStorage.getItem(`gameConfig_${gamename}`);
  //   if (config) {
  //     return JSON.parse(config);
  //   }
  //   // 使用默认的设置
  //   return { rows: 30, cols: 20, bombs: 10, blockSize: 25 };
  // }

  // function saveConfig(gamename: string, config: GameConfig) {
  //   localStorage.setItem(`gameConfig_${gamename}`, JSON.stringify(config));
  // }

  async function loadAssets() {
    Assets.reset(); // 重置资源，避免重复加载
    const manifest = {
      bundles: [
        {
          name: "load-scene",
          assets: [
            {
              alias: "block_0",
              src: "/game001/0.png",
            },
            {
              alias: "block_1",
              src: "/game001/1.png",
            },
            {
              alias: "block_2",
              src: "/game001/2.png",
            },
            {
              alias: "block_3",
              src: "/game001/3.png",
            },
            {
              alias: "block_4",
              src: "/game001/4.png",
            },
            {
              alias: "block_5",
              src: "/game001/5.png",
            },
            {
              alias: "block_6",
              src: "/game001/6.png",
            },
            {
              alias: "block_7",
              src: "/game001/7.png",
            },
            {
              alias: "block_8",
              src: "/game001/8.png",
            },
            {
              alias: "block",
              src: "/game001/9.png",
            },
            {
              alias: "block_mark",
              src: "/game001/10.png",
            },
            {
              alias: "bomb",
              src: "/game001/11.png",
            },
            {
              alias: "block_question",
              src: "/game001/12.png",
            },
            {
              alias: "bomb_highlight",
              src: "/game001/13.png",
            },
          ],
        },
        {
          name: "numbers",
          assets: [
            {
              alias: "number_0",
              src: "/game001/number_00.png",
            },
            {
              alias: "number_1",
              src: "/game001/number_01.png",
            },
            {
              alias: "number_2",
              src: "/game001/number_02.png",
            },
            {
              alias: "number_3",
              src: "/game001/number_03.png",
            },
            {
              alias: "number_4",
              src: "/game001/number_04.png",
            },
            {
              alias: "number_5",
              src: "/game001/number_05.png",
            },
            {
              alias: "number_6",
              src: "/game001/number_06.png",
            },
            {
              alias: "number_7",
              src: "/game001/number_07.png",
            },
            {
              alias: "number_8",
              src: "/game001/number_08.png",
            },
            {
              alias: "number_9",
              src: "/game001/number_09.png",
            },
            {
              alias: "number_dot",
              src: "/game001/dot.png",
            },
          ]
        }
      ],
    };
    await Assets.init({
      manifest,
      // Optimize for device capabilities
      texturePreference: {
        resolution: window.devicePixelRatio,
        format: ["webp", "png"],
      },
      // Set global preferences
      preferences: {
        crossOrigin: "anonymous",
      },
    });
    await Assets.loadBundle(["load-scene"]);
    await Assets.loadBundle(["numbers"]);
  }

  async function loadTapBarUi(
    newGameButtonVisible = true,
    resetButtonVisible = true,
    scoreBoardVisible = true,
    timeBoardVisible = true,
  ) {
    // gamecontrol ui
    const gameUi = new Container();
    app.stage.addChild(gameUi);
    gameUi.position.set(
      (app.screen.width - gameSize.width) / 2,
      (app.screen.height - gameSize.height - gameControlSize.height) / 2,
    );

    // 背景
    const containerBackground = new NineSliceSprite({
      texture: Assets.get("block"),
      leftWidth: 4,
      topHeight: 4,
      rightWidth: 4,
      bottomHeight: 4,
      width: gameSize.width + 6,
      height: gameSize.height + gameControlSize.height + 6,
    });
    containerBackground.position.set(10, 10);
    gameUi.addChild(containerBackground);

    // 顶层控制器
    const controlContainer = new Container();
    gameUi.addChild(controlContainer);
    controlContainer.position.set(12, 12); // 边距

    // 顶层控制器 - 新游戏按钮
    if(newGameButtonVisible) {
      const newGameButton = Button("新游戏", newGame);
      controlContainer.addChild(newGameButton);
    }
    
    // 顶层控制器 - 重新开始按钮
    if(resetButtonVisible) {
      const resetButton = Button("重新开始", resetGame);
      controlContainer.addChild(resetButton);
      resetButton.position.set(0, resetButton.height);
    }

    

    // 计分板配置
    const scoreBoardWidth = 31.61 * 3 // (44 / 84 * 68) * 2 + 6
    const scoreBoardHeight = 68;

    // 数字相关的配置
    const numberHeight = scoreBoardHeight - 24;
    const numberSpacing = 4;
    const numberPaddingY = 12;
    
    if(scoreBoardVisible) {
      // 顶层控制器 - 计分板
      const scoreBoardContainer = new Container();
      controlContainer.addChild(scoreBoardContainer);
      // scoreBoardContainer.position.set(200, 0); // 暂时，后面做好了ui后直接计算宽度来放置到最右侧
      // 顶层控制器 - 计分板 - 背景与边框
      const sourceBorder = new NineSliceSprite({
        texture: Assets.get("block"),
        leftWidth: 4,
        topHeight: 4,
        rightWidth: 4,
        bottomHeight: 4,
        width: scoreBoardWidth,
        height: scoreBoardHeight,
      });
      scoreBoardContainer.addChild(sourceBorder);
      const scoreBoardBackground = new Graphics();
      scoreBoardBackground.rect(3, 3, scoreBoardWidth - 6, scoreBoardHeight - 6).fill(0x000000).closePath();
      scoreBoardContainer.addChild(scoreBoardBackground);
      
      // 顶层控制器 - 计分板 - 计分板数字
      const sourceNum0 = createNumber(0, numberHeight);
      const sourceNum1 = createNumber(0, numberHeight);
      const sourceNum2 = createNumber(0, numberHeight);
      sourceNum0.sprite && (scoreBoardContainer.addChild(sourceNum0.sprite), sourceNum0.sprite.position.set(8, numberPaddingY));
      sourceNum1.sprite && (scoreBoardContainer.addChild(sourceNum1.sprite), sourceNum1.sprite.position.set(8 + numberSpacing + sourceNum1.sprite.width, numberPaddingY));
      sourceNum2.sprite && (scoreBoardContainer.addChild(sourceNum2.sprite), sourceNum2.sprite.position.set(8 + (numberSpacing + sourceNum2.sprite.width) * 2, numberPaddingY));
      gameSource.onePlace = sourceNum2;
      gameSource.tenPlace = sourceNum1;
      gameSource.hundredPlace = sourceNum0;
      scoreBoardContainer.position.set(gameSize.width - scoreBoardWidth, 0);
    }
    
    // 时间面板配置 
    // const timeBoardWidth = 33.61 * 4 + numberSpacing * 2 + 6; // (44 / 84 * 68) * 4 + numberSpacing * 3 + 6
    // const timeBoardHeight = 68;
    if(timeBoardVisible) {
      // const timeBoardContainer = new Container();
      // controlContainer.addChild(timeBoardContainer);
      // // timeBoardContainer.position.set(scoreBoardContainer.x + scoreBoardWidth + 20, 0);
      // // 时间面板背景与边框
      // const timeBoardBorder = new NineSliceSprite({
      //   texture: Assets.get("block"),
      //   leftWidth: 4,
      //   topHeight: 4,
      //   rightWidth: 4,
      //   bottomHeight: 4,
      //   width: timeBoardWidth,
      //   height: timeBoardHeight,
      // });
      // timeBoardContainer.addChild(timeBoardBorder);
      // const timeBoardBackground = new Graphics();
      // timeBoardBackground.rect(3, 3, timeBoardWidth - 6, timeBoardHeight - 6).fill(0x000000).closePath();
      // timeBoardContainer.addChild(timeBoardBackground);
      // // 顶层控制器 - 时间面板 - 时间数字
      // const timeNum0 = createNumber(0, numberHeight);
      // const timeNum1 = createNumber(0, numberHeight);
      // const timeNum2 = createNumber(0, numberHeight);
      // const timeNum3 = createNumber(0, numberHeight);
      // const timeDot = createNumber("dot", numberHeight);
      // timeNum0.sprite && (timeBoardContainer.addChild(timeNum0.sprite), timeNum0.sprite.position.set(8,numberPaddingY));
      // timeNum1.sprite && (timeBoardContainer.addChild(timeNum1.sprite), timeNum1.sprite.position.set(8 + timeNum1.sprite.width + numberSpacing, numberPaddingY));
      // timeDot.sprite && (timeBoardContainer.addChild(timeDot.sprite), timeDot.sprite.position.set( 8 + (timeDot.sprite.width + numberSpacing) * 2, numberPaddingY));
      // timeNum2.sprite && (timeBoardContainer.addChild(timeNum2.sprite), timeNum2.sprite.position.set( 8 +(timeNum2.sprite.width + numberSpacing) * 3, numberPaddingY));
      // timeNum3.sprite && (timeBoardContainer.addChild(timeNum3.sprite), timeNum3.sprite.position.set( 8 +(timeNum3.sprite.width + numberSpacing) * 4, numberPaddingY));
      // timeBoardContainer.position.set(gameSize.width - scoreBoardWidth - timeBoardWidth - 0, 0);
    }
  }

  async function loadGame() {
    const startX = (app.screen.width - gameSize.width + gameConfig.blockSize) / 2;
    const startY = (app.screen.height - gameSize.height + gameControlSize.height) / 2 + 12;
    // 创建游戏容器
    const gameContainer = new Container();
    app.stage.addChild(gameContainer);
    gameContainer.position.set(startX, startY);

    // 创建游戏方块
    for(let i = 0; i < gameConfig.cols; i++) {
      for(let j = 0; j < gameConfig.rows; j++) {
        const sprite = new Sprite({
          texture: Assets.get("block"),
          width: gameConfig.blockSize,
          height: gameConfig.blockSize,
        })
        const block: Block = {
          sprite,
          isBomb: false,
          isMarked: false,
          isRevealed: false,
          isQuestioned: false,
        }
        sprite.interactive = true;
        sprite.addEventListener("pointertap", (event) => handleSpriteClick(event, i, j));
        sprite.position.set(i * gameConfig.blockSize, j * gameConfig.blockSize);
        gameContainer.addChild(sprite);
        blocks[i] = blocks[i] || [];
        blocks[i][j] = block;
      }
    }

    // 放置炸弹
    const putBomb = (x: number, y: number) => {
      if(blocks[x][y].isBomb){
        return putBomb(Math.floor(Math.random() * gameConfig.cols), Math.floor(Math.random() * gameConfig.rows));
      } else {
        blocks[x][y].isBomb = true;
        return true;
      }
    }
    for(let i = 0; i < gameConfig.bombs; i++) {
      putBomb(Math.floor(Math.random() * gameConfig.cols), Math.floor(Math.random() * gameConfig.rows));
    }

    // 
  }

  function handleSpriteClick(event: FederatedPointerEvent, x: number, y: number) {
    const button = event.button; // 0: 左键, 1: 中键, 2: 右键
    const block = blocks[x][y];
    if(block.isRevealed) {
      return; // 不做处理
    }
    // 左键揭示土块
    if(button === 0) {
      if(block.isMarked || block.isQuestioned) return;
      block.isRevealed = true;
      if(block.isBomb) {
        gameOver(x, y);
        return;
      }
      block.sprite.texture = Assets.get(`block_${countAdjacentBombs(x, y)}`);
    } else if(button === 2) {
      if(block.isMarked) {
        block.isMarked = false;
        block.isQuestioned = true;
        block.sprite.texture = Assets.get("block_question");
      } else if(block.isQuestioned) {
        block.isQuestioned = false;
        block.sprite.texture = Assets.get("block");
        gameSource.setSource(gameSource.source - 1);
      } else {
        block.isMarked = true;
        block.sprite.texture = Assets.get("block_mark");
        gameSource.setSource(gameSource.source + 1);
      }
    }
    checkWin();
    
    
  }

  function autoClickBlock(x: number, y: number) {
    const block = blocks[x]?.[y] || null;
    if((!block) || block.isRevealed || block.isMarked) {
      return; // 不做处理
    }
    block.isRevealed = true;
    const count = countAdjacentBombs(x, y);
    block.sprite.texture = Assets.get(`block_${count}`);
  }


  function countAdjacentBombs(x: number, y: number): number {
    let count = 0;
    for(let i = -1; i <= 1; i++){
      for(let j = -1; j <= 1; j++){
        if(i === 0 && j === 0) continue; // 跳过自己
        const block = blocks[x+i]?.[y+j];
        if(block?.isBomb) count++;
      }
    }
    // 如果周围没有格式，就自动揭示周围的格子
    if(count === 0) {
      autoClickBlock(x, y-1);
      autoClickBlock(x, y+1);
      autoClickBlock(x-1, y);
      autoClickBlock(x+1, y);
      return 0;
    }
    return count;
  }

  function gameOver(x: number, y: number) {
    // clearGame();
    for(let i = 0; i < gameConfig.cols; i++) {
      for(let j = 0; j < gameConfig.rows; j++) {
        const block = blocks[i][j];
        if(block.isBomb) {
          block.sprite.texture = Assets.get("bomb");
        }
        block.sprite.interactive = false; // 停止事件监听
      }
    }
    blocks[x][y].sprite.texture = Assets.get("bomb_highlight");
  }

  function checkWin() {
    let success = true;
    for(let i = 0; i < gameConfig.cols; i++) {
      for(let j = 0; j < gameConfig.rows; j++) {
        const block = blocks[i][j];
        if(block.isBomb && !block.isMarked) {
          success = false;
          return; // 还有未标记的炸弹，不能胜利
        }
        if(!block.isBomb && !block.isRevealed) {
          success = false;
          return; // 还有未揭示的非炸弹格子，不能胜利
        }
      }
    }
    if(success) {
      // 游戏胜利逻辑
      gameWin()
    }
  }

  function gameWin() {
    for(let i = 0; i < gameConfig.cols; i++) {
      for(let j = 0; j < gameConfig.rows; j++) {
        const block = blocks[i][j];
        block.sprite.interactive = false; // 停止事件监听
      }
    }
    // console.log("游戏胜利");
    app.stage.removeChildren(); // 清理屏幕
    loadTapBarUi(true, true, false, false);
    const gameDialogContainer = new Container();
    app.stage.addChild(gameDialogContainer);
    const winnerText = new Text({
      text: "游戏获胜！！！",
      style: {
        fill: "black",
        fontSize: 24
      },
    })
    gameDialogContainer.addChild(winnerText);
    
    // const newButton = Button("再来一局", resetGame);
    // gameDialogContainer.addChild(newButton);
    // newButton.position.set(0, 50);

    gameDialogContainer.pivot.set(gameDialogContainer.width / 2, gameDialogContainer.height / 2);
    gameDialogContainer.position.set(
      (app.screen.width) / 2 + 20,
      (app.screen.height) / 2 - 50,
    )
  }

  function resetGame() {
    app.stage.removeChildren(); // 清理屏幕
    loadTapBarUi();
    loadGame();
  }

  function newGame() {
    // 增加难度选择框
    app.stage.removeChildren(); // 清理屏幕
    loadTapBarUi(false, false, false, false);

    const diffcultyContainer = new Container();
    app.stage.addChild(diffcultyContainer);

    const easyButton = Button("简单", () => {
      gameConfig.rows = 9;
      gameConfig.cols = 16;
      gameConfig.bombs = 10;
      saveConfig<GameConfig>("saolei", gameConfig);
      resetGame();
    });
    const mediumButton = Button("中等", () => {
      gameConfig.rows = 18;
      gameConfig.cols = 24;
      gameConfig.bombs = 40;
      saveConfig<GameConfig>("saolei", gameConfig);
      resetGame();
    });
    const hardButton = Button("困难", () => {
      gameConfig.rows = 24;
      gameConfig.cols = 32;
      gameConfig.bombs = 120;
      saveConfig<GameConfig>("saolei", gameConfig);
      resetGame();
    });
    const speButton = Button("特别", () => {
      gameConfig.rows = 30;
      gameConfig.cols = 64;
      gameConfig.bombs = 420;
      saveConfig<GameConfig>("saolei", gameConfig);
      resetGame();
    });
    diffcultyContainer.addChild(easyButton);
    diffcultyContainer.addChild(mediumButton);
    diffcultyContainer.addChild(hardButton);
    diffcultyContainer.addChild(speButton);

    mediumButton.position.set(0, easyButton.height + 12);
    hardButton.position.set(0, (easyButton.height + 12) * 2);
    speButton.position.set(0, (easyButton.height + 12) * 3);
    diffcultyContainer.position.set(
      (app.screen.width - easyButton.width) / 2,
      (app.screen.height - easyButton.height * 3 - 12 * 2) / 2,
    )

  }
}
