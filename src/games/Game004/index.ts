import * as PIXI from "pixi.js";
import type { CardSeque, Card } from "./type";
import gsap from "gsap";

/**
 *
 * @param canvas
 * @returns
 */
export default async function initGame(
  canvas: HTMLDivElement,
): Promise<() => void> {
  const config = {
    slotSize: 10, // 牌槽数量
    cardGroup: 8, // n副牌
    cardType: 4, // n种花色
    cardCount: 13, // 一个花色有n张牌
  };

  // 绘制场景
  const app = new PIXI.Application();
  await app.init({
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    background: "#3e3e3e",
    preference: "webgl", // or 'webgpu'
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  canvas.appendChild(app.renderer.canvas);

  // 准备素材资源
  const suits = ["spade", "heart", "diamond", "club"].slice(0, config.cardType);
  const rangks = [
    ...Array.from({ length: 10 }, (_, index) => String(index + 1)),
    "jack",
    "queen",
    "king",
  ];
  const cardAssets = suits.flatMap((suit) => {
    return rangks.map((rank) => ({
      alias: `card_${suit}_${rank}`,
      src: `/game004/cards/${suit}_${rank}.png`,
    }));
  });

  cardAssets.push({
    alias: "card_back",
    src: "/game004/cards/back-0062ff.png",
  });

  PIXI.Assets.addBundle("spider-cards", cardAssets);
  const assetsBundle = await PIXI.Assets.loadBundle("spider-cards");

  const cardSeques: CardSeque[] = []; // 卡槽精灵队列
  const cardSequePadding = 12; // slot之间的间距
  const cardSequeWidth = 128;
  const cardSequeHeight = 188;
  // 这个是不是单个的margin, 而是整个cardSeques与屏幕边缘的padding
  const cardSequesInlinePadding =
    (canvas.clientWidth -
      config.slotSize * (cardSequeWidth + cardSequePadding * 2)) /
    2;
  const cardSqquesTopPadding = 48;

  // console.log(
  //   canvas.clientWidth,
  //   config.slotSize,
  //   cardSequeWidth,
  //   cardSequePadding,
  // )

  for (let i = 0; i < config.slotSize; i++) {
    const position = [
      (cardSequeWidth + cardSequePadding * 2) * i + cardSequesInlinePadding,
      cardSqquesTopPadding,
    ];
    const cardSeque: CardSeque = {
      id: i,
      container: new PIXI.Container(),
      position,
      column: [],
    };
    cardSeque.container.position.set(
      cardSeque.position[0],
      cardSeque.position[1],
    );
    cardSeques.push(cardSeque);
  }

  // 初始化牌堆数据
  // const cardHeaps = []
  // const cardHeapsLength =
  // for(let i = 0; i < )
  // 创建牌堆
  const cards: Card[] = randomCard(createCards());
  const cardsBackup: Card[] = Object.assign([], cards);
  // 等待发牌牌堆
  // let cardsHeap: Card[][] = [];
  // createCardHeap(); // 创建牌堆
  const heapContainer = new PIXI.Container()
  let isDealing = false; // 是否正在发牌
  heapContainer.position.set(
    canvas.clientWidth - 240 - 48,
    canvas.clientHeight - 200,
  );
  app.stage.addChild(heapContainer)
  heapContainer.interactive = true
  heapContainer.eventMode = "static"
  heapContainer.cursor = "pointer";
  heapContainer.addEventListener('click', () => {
    // 从牌堆发10张牌
    dealCard(10)
    console.log('发牌')
  })
  let visibleStockCount = cardsBackup.length;
  const cardSpace = 36; // 牌和牌竖着的间距
  
  drawCardHeap(); // 绘制牌堆
  drawCardSlot();
  dealCardOnStart(); // 开局发牌

  // setTimeout(() => {
  //   dealCard(10)
  // }, 5000);
  


  // 绘制牌槽
  function drawCardSlot() {
    cardSeques.forEach((cardSeque) => {
      const graphics = new PIXI.Graphics();
      graphics
        .beginPath()
        // .roundRect(position[0], position[1], cardSequeWidth, cardSequeHeight)
        .roundRect(0, 0, cardSequeWidth, cardSequeHeight, 4)
        .stroke({
          color:"#ffffff",
          width: 2
        })
        .closePath();
      cardSeque.container.addChild(graphics);
    });
  }

  

  function drawCardHeap() {
    heapContainer.removeChildren();

    const offset = 24;
    const visibleBackCount = Math.ceil(visibleStockCount / config.slotSize);

    for (let i = 0; i < visibleBackCount; i++) {
      const backSprite = createCardSprite("card_back");
      // backSprite.eventMode = "none";
      backSprite.position.set((visibleBackCount - 1 - i) * offset, 0);
      heapContainer.addChild(backSprite);
    }

    const padding = 48;
    heapContainer.position.set(
      canvas.clientWidth - padding - cardSequeWidth - (visibleBackCount - 1) * offset,
      canvas.clientHeight - cardSequeHeight - padding,
    );

  }

  // 游戏开始发54张牌
  function dealCardOnStart() {
    isDealing = true;
    let completedCount = 0;
    // 从cards发60张牌.
    // 先发34张遮盖的牌
    for(let i = 0; i < 54; i ++) {
      const faceupStartIndex = 44
      const slotIndex = i % 10;
      const card = cardsBackup.pop()!
      card.faceUp = false
      
      // 准备动画
      let tempSprite = PIXI.Sprite.from(assetsBundle['card_back'])
      tempSprite.scale.set(cardSequeWidth / tempSprite.width)
      if(i > faceupStartIndex) {
        tempSprite = createCardSprite(`card_${card.suit}_${card.rank}`)
        card.faceUp = true
      }
      
      const targetIndex = cardSeques[slotIndex].column.length;
      cardSeques[slotIndex].column.push(card)
      const target = app.stage.toLocal(
        cardSeques[slotIndex].container.toGlobal(
          new PIXI.Point(0, cardSpace * targetIndex),
        ),
      )

      // tempSprite.position.set(start.x, start.y)
      tempSprite.zIndex = 999

      gsap.delayedCall(i * 0.05, () => {
        const start = app.stage.toLocal(heapContainer.toGlobal(new PIXI.Point(0, 0)))
        tempSprite.position.copyFrom(start);
        app.stage.addChild(tempSprite);
        visibleStockCount--;
        drawCardHeap();

        gsap.to(tempSprite, {
          x: target.x,
          y: target.y,
          duration: 0.25,
          onComplete: () => {
            tempSprite.destroy()
            if(i > faceupStartIndex) {
              cardSeques[slotIndex].container.addChild(card.sprite)
              card.sprite.position.set(0, cardSpace * targetIndex)
            } else {
              cardSeques[slotIndex].container.addChild(card.backsprite)
              card.backsprite.position.set(0, cardSpace * targetIndex)
              card.backsprite.on("pointertap", () => tryFlipCard(card))
            }
            card.cardSeque = cardSeques[slotIndex]
            completedCount ++ 
            if (completedCount === 54) {
              isDealing = false;
            }
           
          }
        })
      })
    }
  }

  function dealCard(count: number): boolean{
    if (isDealing || count !== config.slotSize || cardsBackup.length < count) {
      return false;
    }

    isDealing = true;
    let completedCount = 0;
    
    // 发牌
    for(let i = 0; i < count; i++){
      const slotIndex = i % 10;
      const card = cardsBackup.pop()!

      // 准备动画
      const tempSprite = createCardSprite(`card_${card.suit}_${card.rank}`)
      // tempSprite.scale.set(cardSequeWidth / tempSprite.width)
      card.faceUp = true
      
      const targetIndex = cardSeques[slotIndex].column.length;
      cardSeques[slotIndex].column.push(card)
      const target = app.stage.toLocal(
        cardSeques[slotIndex].container.toGlobal(
          new PIXI.Point(0, cardSpace * targetIndex),
        ),
      )

      // tempSprite.position.set(start.x, start.y)
      tempSprite.zIndex = 999

      gsap.delayedCall(i * 0.05, () => {
        const start = app.stage.toLocal(heapContainer.toGlobal(new PIXI.Point(0, 0)))
        tempSprite.position.copyFrom(start);
        app.stage.addChild(tempSprite);
        visibleStockCount--;
        drawCardHeap();

        gsap.to(tempSprite, {
          x: target.x,
          y: target.y,
          duration: 0.25,
          onComplete: () => {
            tempSprite.destroy()
            cardSeques[slotIndex].container.addChild(card.sprite)
            card.sprite.position.set(0, cardSpace * targetIndex)
            card.cardSeque = cardSeques[slotIndex]

            completedCount++;
            if (completedCount === count) {
              isDealing = false;
            }
          },
        })
        
      })
    }
    return true
    
  }

  // 绘制计分板
  function drawBoard() {}

  // 渲染
  render();
  function render() {
    cardSeques.forEach((cardSeque) => {
      app.stage.addChild(cardSeque.container);
    });
  }

  // 创建卡牌纹理
  function createCardSprite(assetsName: string): PIXI.Sprite {
    try {
      const sprite = PIXI.Sprite.from(assetsBundle[assetsName]);
      sprite.scale.set(cardSequeWidth / sprite.width);
      sprite.interactive = true;
      sprite.eventMode = "static";
      return sprite;
    } catch (err) {
      // const sprite = new PIXI.Sprite();
      // return false
      throw new Error('错误的资源名称')
    }
  }

  function createCards(): Array<Card> {
    const setsPerSuit = config.cardGroup / config.cardType;
    const cards: Card[] = [];
    for (let suitIndex = 0; suitIndex < config.cardType; suitIndex++) {
      for (let setIndex = 0; setIndex < setsPerSuit; setIndex++) {
        for (let rank = 0; rank < config.cardCount; rank++) {
          const card = createCard(
            `${suitIndex}-${setIndex}-${rank}`,
            suits[suitIndex],
            rangks[rank],
          ) || null
          cards.push(card!);
        }
      }
    }

    return cards;
  }

  function createCard(id: Card["id"], suit: string, rank: string): Card | null {
    const sprite = createCardSprite(`card_${suit}_${rank}`)
    const backSprite = createCardSprite("card_back")
    backSprite.interactive = true;
    backSprite.eventMode = 'static';
    if(!sprite) {
      throw new Error("错误的资源id");
      return null
    }
    return {
      id,
      suit,
      rank,
      faceUp: false,
      sprite: sprite,
      backsprite: backSprite,
    };
  }

  // 尝试翻牌
  function tryFlipCard(card: Card) {
    if (isDealing || card.faceUp) return;
    const column = card.cardSeque?.column || []
    const target = column[column.length -1]
    const isTopCard = (target == card);
    if(isTopCard) {
      card.faceUp = true
      const position = target.backsprite.position
      const container = card.cardSeque?.container!;
      target.sprite.position.set(position.x, position.y);

      // 执行动画
      const back = card.backsprite
      const front = card.sprite

      const backScaleX = back.scale.x;
      const frontScaleX = front.scale.x;
      const cardY = back.y;
      const centerX = cardSequeWidth / 2;

      // 临时把旋转缩放中心放在牌的中央
      back.pivot.x = back.texture.orig.width / 2;
      back.x = centerX;

      front.pivot.x = front.texture.orig.width / 2;
      front.x = centerX;
      front.y = cardY;
      front.scale.x = 0;

      gsap.timeline()
      .to(back.scale, { x: 0, duration: 0.12 })
      .call(() => {
        // 替换操作
        container.removeChild(back);
        container.addChild(front);
      })
      .to(front.scale, { x: frontScaleX, duration: 0.12 })
      .call(() => {
        // 恢复正常布局坐标，避免影响后续移动和重新排版
        back.scale.x = backScaleX;
        back.pivot.x = 0;
        back.x = 0;

        front.pivot.x = 0;
        front.x = 0;
        front.y = cardY;
      });
      // container.removeChild(target.backsprite)
      // container.addChild(target.sprite)
    }
  }

  function randomCard(cards: Card[]) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)) ;
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  return () => {};
}
