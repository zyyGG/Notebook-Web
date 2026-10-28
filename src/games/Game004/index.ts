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
  let isSettling = false; // 是否正在结算放牌中
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

  // 完成牌堆
  const foundationContainer = new PIXI.Container();
  foundationContainer.position.set(48, canvas.clientHeight - cardSequeHeight - 48)
  app.stage.addChild(foundationContainer)

  let visibleStockCount = cardsBackup.length;
  const cardSpace = 36; // 牌和牌竖着的间距
  let completedRuns = 0;

  app.stage.eventMode = "static"
  type DragState = {
    card: Card;
    column: CardSeque;
    startIndex: number; // 
    startPositions: {x: number, y:number}[]
    group: Card[],
    // startX: number;
    // startY: number;
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
    // 我们只更新第一张的位置, 然后其他的牌根据第一张牌的位置来做平移
    const targetX = pointer.x + dragState.grabOffsetX;
    const targetY = pointer.y + dragState.grabOffsetY;

    const dx = targetX - dragState.card.sprite.x;
    const dy = targetY - dragState.card.sprite.y;

    dragState.group.forEach((c) => {
      c.sprite.x += dx;
      c.sprite.y += dy;
    })
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
      if (isDealing || isSettling || dragState || !card.faceUp || !column) {
        return;
      }

      const index = column.column.indexOf(card)
      if(index < 0 || !canDragSeq(column.column, index)) return;

      // 
      const group = column.column.slice(index)
      const startPositions = group.map(c => ({x: c.sprite.x, y: c.sprite.y }))

      // 指针先换算到拖拽层坐标
      const pointer = dragContainer.toLocal(event.global)

      // 按下牌更换父容器后, 在拖拽层中的位置
      const cardInDrag = dragContainer.toLocal(card.sprite.getGlobalPosition())

      group.forEach((c) => {
        const inDrag = dragContainer.toLocal(c.sprite.getGlobalPosition())
        dragContainer.addChild(c.sprite)
        c.sprite.position.copyFrom(inDrag)
      })
      
      // const spriteGlobal = card.sprite.getGlobalPosition(); // 获取sprite在整个画布中的世界坐标, 
      // const pointer = column.container.toLocal(event.global); // 得到点击位置坐标
      // const spriteInDrag = dragContainer.toLocal(spriteGlobal); // dragContaienr根据世界坐标获取到本地内部坐标
      // const pointer = dragContainer.toLocal(event.global); // 得到点击位置坐标
      // console.log(dragContainer.position, pointer, event.global)
      
      // const startX = card.sprite.x
      // const startY = card.sprite.y
      // card.sprite.position.copyFrom(spriteInDrag)
      // dragContainer.addChild(card.sprite)
      
      
      dragState = {
        card: card,
        column: column, 
        startIndex: index,
        group,
        startPositions,
        // startX: startX,
        // startY: startY,
        // grabOffsetX: card.sprite.x - pointer.x,
        // grabOffsetY: card.sprite.y - pointer.y,
        grabOffsetX: cardInDrag.x - pointer.x,
        grabOffsetY: cardInDrag.y - pointer.y,
      }
      
    })
  }

  // 结束拖拽
  function finishDrag(event: PIXI.FederatedPointerEvent) {
    if(!dragState) return

    const { card, column, group, startIndex, startPositions } = dragState
    // findTargetOnColumn()
    // 清理拖拽信息
    dragState = null
    isSettling = true; // 结束的时候动画都还在执行中. 需要动画执行完之后,才会执行放牌操作
    const targetSeq = findTargetOnColumn(event.global)
    let finished = 0;
    const settle = () => {
      if(++finished !== group.length) return;
      isSettling = false

      if(targetSeq) checkCompleteRun(targetSeq)
    }
    
    // 获取到
    const movingCard = group[0]
    
    

    // 判断条件: 
    // targetSeq 是否成立
    // targetSeq与 正在被移动column是不是同一个seq, 是就不用移动
    if(
      targetSeq && 
      targetSeq.id !== column.id && 
      canplace(movingCard, targetSeq.column[targetSeq.column.length - 1])
    ){
      // const targetCard = targetSeq.column[targetSeq.column.length - 1]
      // 从原来的数组中移除,然后加入新的卡槽队列中
      // column.column.pop()

      // 确定可以放置, 那就开始处理数据
      // 把正在移动的给从原来的数组剔除
      column.column.splice(startIndex, group.length);

      // 准备翻牌
      const newTop = column.column[column.column.length - 1]
      if(newTop && !newTop.faceUp == true) {
        tryFlipCard(newTop)
      }

      const baseIndex = targetSeq.column.length; // 等会儿新数组开始插入的起始位置
      group.forEach((c, i) => {
        c.cardSeque = targetSeq; // 卡的缓存seq更新
        targetSeq.column.push(c); // 放入新的card

        const destination = dragContainer.toLocal(
          targetSeq.container.toGlobal(
            new PIXI.Point(0, cardSpace * (baseIndex + i)), // 这里是通过增量偏移来计算目标位置
          )
        )

        gsap.to(c.sprite, {
          x: destination.x,
          y: destination.y,
          duration: 0.2,
          onComplete: () => {
            // 动画播完之后, 放入card. 
            targetSeq.container.addChild(c.sprite);
            c.sprite.position.set(0, cardSpace * (baseIndex + i));
            settle()
          }, 
        })
      })
    } else {
      group.forEach((c, i) => {
        const back = dragContainer.toLocal(
          column.container.toGlobal(
            new PIXI.Point(startPositions[i].x, startPositions[i].y)
          )
        )
        // 松开后, 回到最开始的位置
        gsap.to(c.sprite, {
          x: back.x,
          y: back.y,
          duration: 0.35,
          onComplete: () => {
            // 把
            column.container.addChild(c.sprite)
            c.sprite.position.set(startPositions[i].x, startPositions[i].y)
            settle()
          }
        })
      })
    }
  }

  // 判断能否拖拽
  function canDragSeq(column: Card[], startIndex: number): boolean {
    const group = column.slice(startIndex); // 没传末尾就是自动到末尾
    if(group.length === 0) return false;

    return group.every((card, i) => {
      if(!card.faceUp) return false;
      if(i === 0) return true;

      const prev = group[i - 1]
      // 花色不同也是可以拖拽的. 只是结算的时候不行
      return rankValue(prev.rank) === rankValue(card.rank) + 1;
    })
  }

  // 判断能否放置
  function canplace(card: Card, target:Card | undefined): boolean {
    if(!target) return true; // undefinded 就是准备移动到空列中了.
    if(!target.faceUp) return false; // 处于背面的牌不能放
    // 拖拽的卡数字得比目标列的数字小一, 
    return rankValue(card.rank) + 1 === rankValue(target.rank)
  }

  // 从column中查找目标队列
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

  // 检查有没有完成一套牌
  function checkCompleteRun(seq: CardSeque) {
    const run = findCompletedRun(seq.column); // 找到匹配的套牌
    if(!run) return

    isSettling = true; // 避免动画期间 拖牌造成bug
    seq.column.splice(seq.column.length - run.length); // 把牌从旧的移除

    // 用来决定这牌放在那里
    const setIndex = completedRuns;
    const baseX = setIndex * 24
    const innerOffset = 2;

    let finished = 0;
    const done = () => {
      if(++finished !== run.length) return;

      // 牌移走后, 新的顶牌要翻开
      const newTop = seq.column[seq.column.length - 1]
      if (newTop && !newTop.faceUp) tryFlipCard(newTop);

      completedRuns++;
      isSettling = false
      if (completedRuns === 8) handleWin();
    }

    run.forEach((c, i) => {
      const localX = baseX + i * innerOffset;
      const destination = dragContainer.toLocal(
        foundationContainer.toGlobal(new PIXI.Point(localX, 0)),
      );

      gsap.to(c.sprite, {
        x: destination.x,
        y: destination.y,
        duration: 0.3,
        delay: i * 0.01,
        onComplete: () => {
          foundationContainer.addChild(c.sprite)
          c.sprite.position.set(i * 8, 0)
          c.cardSeque = undefined; // 这套牌就不可点击了
          done()
        }
      })
    })
  }

  // 
  function findCompletedRun(column: Card[]): Card[] | null{
    if(column.length < 13 ) return null;

    const run = column.slice(-13); // 只判断末尾的13张牌

    if (!run.every((c) => c.faceUp)) return null; // 判断所有牌是否都已翻开

    const suit = run[0].suit;
    const isRun = run.every(
      (c, i) => c.suit === suit && rankValue(c.rank) === 13 - i
    );

    return isRun ? run : null

  }

  function handleWin() {
    console.log("your win")
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
      bindCardDrag(target)

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
