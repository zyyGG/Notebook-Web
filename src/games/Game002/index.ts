import { Application, Assets, Container, Graphics, Sprite, FederatedPointerEvent } from "pixi.js";
import { loadConfig, saveConfig } from "../utils/index"
import Button from "../components/Button"
import type { Block } from "./type";

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

  const gameConfig = loadConfig("lianliankan", {
    rows: 10,
    cols: 24,
    blockSize: 75,
    blockAspect: 1 / 1.5, 
    blockHeightOffset: -14,
    matchCount: 3, // 匹配n对
  })
  const gameSize = {
    get width() {
      return gameConfig.cols * gameConfig.blockSize * gameConfig.blockAspect;
    },
    get height() {
      return gameConfig.rows * (gameConfig.blockSize + gameConfig.blockHeightOffset);
    }
  }
  const blocks: Block[] = [];
  const matchedBlocks: Block[] = []; // 已经被匹配的block
  let sceneContainer: Container;
  let controlContainer: Container;

  await loadAssets();
  await loadUi();
  await loadScene();


  // 加载资源
  async function loadAssets() {
    const manifest = {
      bundles: [
        {
          name: "main-scene",
          assets: (() => {
              const assets = [];
              for(let i = 1; i <= 42; i++){
                assets.push({
                  alias: `block_${i}`,
                  src: `/game002/${i.toString().padStart(2, "0")}@2x.png`,
                })
              }
              return assets;
            })()
        }
      ]
    };

    await Assets.init({ manifest });
    await Assets.loadBundle(["main-scene"]);
  }

  // 加载ui
  async function loadUi() {
     // 创建游戏场景
    sceneContainer = new Container();
    app.stage.addChild(sceneContainer);

    sceneContainer.x = (app.screen.width - gameSize.width) / 2;
    sceneContainer.y = (app.screen.height - gameSize.height) / 2;

    // const sceneContainerBg = new Graphics();
    // sceneContainerBg.rect(0, 0, gameSize.width, gameSize.height).fill(0xffffff);
    // sceneContainer.addChild(sceneContainerBg);

    const controlSize = {
      width: gameSize.width,
      height: 40,
    }

    // 控制条容器
    controlContainer = new Container();
    app.stage.addChild(controlContainer);
    // 控制条背景
    const controlBg = new Graphics();
    controlBg.rect(0, 0, controlSize.width, controlSize.height).fill(0x4e4e4e);
    controlContainer.addChild(controlBg);
    controlContainer.x = sceneContainer.x;
    controlContainer.y = sceneContainer.y - controlSize.height;
    // 控制条 - 新游戏按钮
    const newGameButton = new Button({
      text: "新游戏",
      textStyle: {
        fontSize: 16,
      },
      background: 0x4e4e4e,
      padding: {
        x: 12,
        y: 10,
      },
      onClick: () => {
        chooseDifficulty();
      }
    })
    newGameButton.position.set(0, 0);
    controlContainer.addChild(newGameButton);
    // 控制条 - 重新开始
    const restartButton = new Button({
      text: "重新开始",
      textStyle: {
        fontSize: 16,
      },
      background: 0x4e4e4e,
      padding: {
        x: 12,
        y: 10,
      },
      onClick: () => {
        resetScene()
      }
    })
    restartButton.position.set(newGameButton.width, 0);
    controlContainer.addChild(restartButton);
  }

  async function loadScene() {
    // 生成block
    for(let row = 1; row < gameConfig.rows - 1; row ++) {
      for(let col = 1; col < gameConfig.cols - 1; col ++) {
        const index = (row - 1) * gameConfig.cols + (col - 1) + 1;
        const blockIndex = Math.floor((index - 1) / (gameConfig.matchCount * 2)) + 1; // 每n对一组，生成一个新的blockIndex
        const sprite =  Sprite.from(Assets.get(`block_${blockIndex}`));
        sprite.width = gameConfig.blockSize * gameConfig.blockAspect;
        sprite.height = gameConfig.blockSize;
        sprite.x = (col) * gameConfig.blockSize * gameConfig.blockAspect;
        sprite.y = (row) * (gameConfig.blockSize + gameConfig.blockHeightOffset);
        sprite.interactive = true;
        sprite.addEventListener("pointerdown" , handleBlockClick)
        sceneContainer.addChild(sprite);

        const block: Block = {
          sprite: sprite,
          row: row,
          col: col,
          matchId: blockIndex, // 用于匹配的id
        }
        blocks.push(block);
      }
    }

    // 打乱blocks顺序
     blocks.splice(0, blocks.length, ...blocks.sort(() => Math.random() - 0.5));
     blocks.forEach((block, index) => {
      const row = Math.floor(index / (gameConfig.cols - 2)) + 1;
      const col = (index % (gameConfig.cols - 2)) + 1;
      block.row = row;
      block.col = col;
      block.sprite.x = (col) * gameConfig.blockSize * gameConfig.blockAspect;
      block.sprite.y = (row) * (gameConfig.blockSize + gameConfig.blockHeightOffset);
      block.sprite.zIndex = 50 + index - row * gameConfig.cols + col; // 根据行列设置zIndex，确保后面生成的在上面
      sceneContainer.addChild(block.sprite);
     })
    
    if (import.meta.env.DEV) {
     console.debug("[Game002] blocks initialized:", blocks.length);
    }
  }

  async function chooseDifficulty() {
    sceneContainer.removeChildren();

    const easyButton = new Button({
      text: "简单",
      textStyle: {
        fontSize: 24,
      },
      background: 0x4e4e4e,
      padding: {
        x: 24,
        y: 8,
      },
      onClick: async () => {
        gameConfig.rows = 12;
        gameConfig.cols = 12;
        gameConfig.matchCount = 4;
        saveConfig("lianliankan", gameConfig);
        app.stage.removeChildren();
        blocks.length = 0;
        matchedBlocks.length = 0;
        await loadUi();
        await loadScene();
      }
    })
    easyButton.position.set((gameSize.width - easyButton.width) / 2, (gameSize.height - easyButton.height) / 2);
    sceneContainer.addChild(easyButton);

    const mediumButton = new Button({
      text: "中等",
      textStyle: {
        fontSize: 24,
      },
      background: 0x4e4e4e,
      padding: {
        x: 24,
        y: 8,
      },
      onClick: async () => {
        gameConfig.rows = 12;
        gameConfig.cols = 24;
        gameConfig.matchCount = 4;
        saveConfig("lianliankan", gameConfig);
        app.stage.removeChildren();
        blocks.length = 0;
        matchedBlocks.length = 0;
        await loadUi();
        await loadScene();
      }
    })
    mediumButton.position.set((gameSize.width - mediumButton.width) / 2, (gameSize.height - mediumButton.height) / 2 + easyButton.height + 20);
    sceneContainer.addChild(mediumButton);

    const hardButton = new Button({
      text: "困难",
      textStyle: {
        fontSize: 24,
      },
      background: 0x4e4e4e,
      padding: {
        x: 24,
        y: 8,
      },
      onClick: async () => {
        gameConfig.rows = 14;
        gameConfig.cols = 36;
        gameConfig.matchCount = 6;
        saveConfig("lianliankan", gameConfig);
        app.stage.removeChildren();
        blocks.length = 0;
        matchedBlocks.length = 0;
        await loadUi();
        await loadScene();
      }
    })
    hardButton.position.set((gameSize.width - hardButton.width) / 2, (gameSize.height - hardButton.height) / 2 + easyButton.height + mediumButton.height + 40);
    sceneContainer.addChild(hardButton);

  }

  function resetScene() {
    sceneContainer.removeChildren();
    blocks.length = 0;
    matchedBlocks.length = 0;
    loadScene();
  }

  function handleBlockClick(e: FederatedPointerEvent) {
    const block = blocks.find(b => b.sprite === e.currentTarget);
    if(!block) return;
    if(matchedBlocks.length == 0) {
      matchedBlocks.push(block);
      block.sprite.position.y += 10;
    } else if(matchedBlocks.length == 1) {
      // 重复点击
      if(matchedBlocks[0] === block) {
        matchedBlocks.length = 0;
        block.sprite.position.y -= 10;
      }

      // 匹配成功
      if(isMatch(matchedBlocks[0], block)) {
        block.sprite.position.y += 10;
        const blockA = matchedBlocks[0];
        const blockB = block;
        blocks.splice(blocks.indexOf(blockA), 1);
        blocks.splice(blocks.indexOf(blockB), 1);
        matchedBlocks.length = 0;
        setTimeout(() => {
          deleteBlock(blockA);
          deleteBlock(blockB);
          
        }, 500);
        
      } else {
        // 匹配失败
        matchedBlocks[0].sprite.position.y -= 10;
        matchedBlocks.length = 0;
      }
    }
  }

  function deleteBlock(block: Block) {
    sceneContainer.removeChild(block.sprite);
  }

  function isMatch(blockA: Block, blockB: Block): Boolean {
    if(blockA.matchId !== blockB.matchId) return false; // matchId不同，直接不匹配

    // 1
    // 横向与左右寻找
    const haMatchGroup = getHorizontalMatchGroup(blockA);
    if(haMatchGroup.includes(blockB)) {
      return true;
    }
    const vaMatchGroup = getVerticalMatchGroup(blockA);
    if(vaMatchGroup.includes(blockB)) {
      return true;
    }

    const hbMatchGroup = getHorizontalMatchGroup(blockB);
    const vbMatchGroup = getVerticalMatchGroup(blockB);

    // 2
    // 判断blockA的横向匹配组与blockB的纵向匹配组是否有交集
    for(let ha of haMatchGroup) {
      for(let vb of vbMatchGroup) {
        if(ha.row === vb.row && ha.col === vb.col && ha.matchId == -1) {
          return true;
        }
      }
    }
    // 判断blockA的纵向匹配组与blockB的横向匹配组是否有交集
    for(let va of vaMatchGroup) {
      for(let hb of hbMatchGroup) {
        if(va.row === hb.row && va.col === hb.col && va.matchId == -1) {
          return true;
        }
      }
    }

    // 3
    // 对blockA的横向延申继续延申做判断
    for(let va of vaMatchGroup) {
      const haMatchGroup2 = getHorizontalMatchGroup(va);
      for(let ha2 of haMatchGroup2) {
        for(let vb of vbMatchGroup) {
          if(ha2.row === vb.row && ha2.col === vb.col && ha2.matchId == -1) {
            return true;
          }
        }
      }
    }
      // 对blockA的纵向延申继续延申做判断
    for(let ha of haMatchGroup) {
      const vaMatchGroup2 = getVerticalMatchGroup(ha);
      for(let va2 of vaMatchGroup2) {
        for(let hb of hbMatchGroup) {
          if(va2.row === hb.row && va2.col === hb.col && va2.matchId == -1) {
            return true;
          }
        }
      }
    }

    // return blockA.matchId === blockB.matchId;

    return false
  } 

  function getHorizontalMatchGroup(block: Block): Block[] {
    const result: Block[] = []
    const hBlocks = blocks.filter(b => b.row === block.row);
    // 向左寻找
    for(let i = block.col - 1; i >= 0; i--) {
      const target = hBlocks.find(b => b.col === i);
      if(target) {
        result.push(target);
        break;
      } else {
        result.push({
          row: block.row,
          col: i,
          matchId: -1, // 虚拟block，matchId为-1
          sprite: null as unknown as Sprite, // 虚拟block没有sprite
        })
      }
    }
    
    // 向右寻找
    for(let i = block.col + 1; i <= gameConfig.cols - 1; i++) {
      const target = hBlocks.find(b => b.col === i);
      if(target) {
        result.push(target);
        break;
      } else {
        result.push({
          row: block.row,
          col: i,
          matchId: -1, // 虚拟block，matchId为-1
          sprite: null as unknown as Sprite, // 虚拟block没有sprite
        })
      }
    }
    
    return result;
  }

  function getVerticalMatchGroup(block: Block): Block[] {
    const result: Block[] = []
    const vBlocks = blocks.filter(b => b.col === block.col);
    // 向上寻找
    for(let i = block.row - 1; i >= 0; i--) {
      const target = vBlocks.find(b => b.row === i);
      if(target) {
        result.push(target);
        break;
      } else {
        result.push({
          row: i,
          col: block.col,
          matchId: -1, // 虚拟block，matchId为-1
          sprite: null as unknown as Sprite, // 虚拟block没有sprite
        })
      }
    }

    // 向下寻找
    for(let i = block.row + 1; i <= gameConfig.rows - 1; i++) {
      const target = vBlocks.find(b => b.row === i);
      if(target) {
        result.push(target);
        break;
      } else {
        result.push({
          row: i,
          col: block.col,
          matchId: -1, // 虚拟block，matchId为-1
          sprite: null as unknown as Sprite, // 虚拟block没有sprite
        })
      }
    }
    
    return result;
  }
}
