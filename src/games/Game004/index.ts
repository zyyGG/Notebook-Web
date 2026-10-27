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
    cardType: 1, // n种花色
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
  const dragContainer = new PIXI.Container()
  app.stage.addChild(dragContainer)
  dragContainer.zIndex = 10; // 拉高图层

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

  app.stage.eventMode = "static"
  type DragState = {
    card: Card;
    column: CardSeque;
    startX: number;
    startY: number;
    grabOffsetX: number;
    grabOffsetY: number;
  };
  let dragState: DragState | null = null;
  app.stage.on("pointerup", finishDrag)
  app.stage.on('pointerupoutside', finishDrag); // 这个是为了解决边缘外松开的问题
  app.stage.on('globalpointermove', (event: PIXI.FederatedPointerEvent)=> {
    if(!dragState) return;

    // 这里通过dragState拿到column的世界坐标
    const pointer = dragContainer.toLocal(event.global);
    dragState.card.sprite.position.set(
      pointer.x + dragState.grabOffsetX,
      pointer.y + dragState.grabOffsetY,
    )
  })

  // 拿来取值的工具
  const RANK_VALUE: Record<string, number> = { jack: 11, queen: 12, king: 13 };
  const rankValue = (rank: string) => RANK_VALUE[rank] ?? Number(rank);
  const suitValue = (suit: string) => suits.indexOf(suit);
 
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
              // // 绑定事件
              bindCardDrag(card)
              // card.sprite.on("pointerdown", () => handleCardDown(card))
              // card.sprite.on("pointermove", () => handleCardMove(card))
              // card.sprite.on("pointerup", () => handleCardUp(card))
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
            bindCardDrag(card)

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


  // 给card绑定拖拽事件
  function bindCardDrag(card: Card) {
    card.sprite.on("pointerdown", (event: PIXI.FederatedPointerEvent) => {
      const column = card.cardSeque;
      if (isDealing || dragState || !card.faceUp || !column) {
        return;
      }
      
      const spriteGlobal = card.sprite.getGlobalPosition(); // 获取sprite在整个画布中的世界坐标, 
      // const pointer = column.container.toLocal(event.global); // 得到点击位置坐标
      const spriteInDrag = dragContainer.toLocal(spriteGlobal); // dragContaienr根据世界坐标获取到本地内部坐标
      const pointer = dragContainer.toLocal(event.global); // 得到点击位置坐标
      // console.log(dragContainer.position, pointer, event.global)
      
      const startX = card.sprite.x
      const startY = card.sprite.y
      card.sprite.position.copyFrom(spriteInDrag)
      dragContainer.addChild(card.sprite)
      
      
      dragState = {
        card: card,
        column: column, 
        startX: startX,
        startY: startY,
        // grabOffsetX: card.sprite.x - pointer.x,
        // grabOffsetY: card.sprite.y - pointer.y,
        grabOffsetX: spriteInDrag.x - pointer.x,
        grabOffsetY: spriteInDrag.y - pointer.y,
      }
      
    })
  }

  // 结束拖拽
  function finishDrag(event: PIXI.FederatedPointerEvent) {
    if(!dragState) return

    const { card, column, startX, startY } = dragState
    // findTargetOnColumn()
    // 清理拖拽信息
    dragState = null
    const targetSeq = findTargetOnColumn(event.global)

    

    if(targetSeq && targetSeq.column ){
      const targetCard = targetSeq.column[targetSeq.column.length - 1]
      if(targetCard && canplace(card, targetCard)) {
        // 从原来的数组中移除,然后加入新的卡槽队列中
        column.column.pop()
        const targetIndex = targetSeq.column.length; // 拿到最后一个位置的坐标
        targetSeq.column.push(card);
        card.cardSeque = targetSeq;
        
        // 计算等会放置的坐标位置
        const destination = dragContainer.toLocal(
          targetSeq.container.toGlobal(
            new PIXI.Point(0, cardSpace * targetIndex)
          )
        )

        gsap.to(card.sprite, {
          x: destination.x,
          y: destination.y,
          duration: 0.2,
          onComplete: () => {
            targetSeq.container.addChild(card.sprite)
            card.sprite.position.set(0, cardSpace * targetIndex)
          }
        })
        return
      }else {
        goBack()
        return
      }
    } else {
      goBack()
    }

    function goBack() {
      const back = dragContainer.toLocal(
        column.container.toGlobal(new PIXI.Point(startX, startY))
      )
      // 松开后, 回到最开始的位置
      gsap.to(card.sprite, {
        x: back.x,
        y: back.y,
        duration: 0.35,
        onComplete: () => {
          column.container.addChild(card.sprite)
          card.sprite.position.set(startX, startY)
        }
      })
    }
    return 
  }

  // 判断能否放置
  function canplace(card: Card, target:Card): boolean {
    if(!target.faceUp) return false; // 处于背面的牌不能放
    // 拖拽的卡数字得比目标列的数字小一, 
    return rankValue(card.rank) + 1 === rankValue(target.rank)
  }

  function findTargetOnColumn(globalPoint: PIXI.Point): CardSeque | null {
    for(const seq of cardSeques) {
      const left = seq.position[0];
      const right = left + cardSequeWidth + cardSequePadding;

      if(globalPoint.x >= left && globalPoint.x < right) {
        return seq
      }
    }
    return null
  }
 



















  // function handleCardDown(card: Card) {
  //   // 没有额外操作中
  //   if(isDealing){
  //     return 
  //   }
  //   // 是否是牌组最后一张


  // }

  // function handleCardMove(card: Card) {

  // }

  // function handleCardUp(card: Card) {

  // }

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
