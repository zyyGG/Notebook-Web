import * as PIXI from "pixi.js";
import { PIECE_COLORS } from "./const";
import type { GameState, Piece } from "./type";

export default class Board extends PIXI.Container {
  private readonly background = new PIXI.Graphics();
  private readonly grid = new PIXI.Graphics();
  private readonly lockedBlocks = new PIXI.Graphics();
  private readonly activeBlock = new PIXI.Graphics();
  private cellSize: number;

  constructor(
    private readonly rows: number,
    private readonly cols: number,
    cellSize: number,
  ) {
    super();
    this.cellSize = cellSize;
    this.addChild(this.background, this.grid, this.lockedBlocks, this.activeBlock);
    this.resize(cellSize);
  }

  resize(cellSize: number) {
    this.cellSize = Math.max(1, cellSize);
    const width = this.cols * this.cellSize;
    const height = this.rows * this.cellSize;
    this.hitArea = new PIXI.Rectangle(0, 0, width, height);

    this.background.clear().roundRect(0, 0, width, height, 6).fill(0x101820);
    this.grid.clear();
    for (let col = 0; col <= this.cols; col++) {
      const x = col * this.cellSize;
      this.grid.moveTo(x, 0).lineTo(x, height);
    }
    for (let row = 0; row <= this.rows; row++) {
      const y = row * this.cellSize;
      this.grid.moveTo(0, y).lineTo(width, y);
    }
    this.grid.stroke({ color: 0x26343d, alpha: 0.8, width: 1 });
  }

  draw(state: GameState) {
    this.lockedBlocks.clear();
    this.activeBlock.clear();

    state.board.forEach((row, y) => {
      row.forEach((type, x) => {
        if (type) this.drawCell(this.lockedBlocks, x, y, type);
      });
    });

    if (state.current) this.drawPiece(this.activeBlock, state.current);
  }

  private drawPiece(graphics: PIXI.Graphics, piece: Piece) {
    piece.shape.forEach((row, shapeY) => {
      row.forEach((filled, shapeX) => {
        const x = piece.x + shapeX;
        const y = piece.y + shapeY;
        if (filled && y >= 0) this.drawCell(graphics, x, y, piece.type);
      });
    });
  }

  private drawCell(graphics: PIXI.Graphics, x: number, y: number, type: Piece["type"]) {
    const inset = Math.max(1, this.cellSize * 0.06);
    const size = Math.max(1, this.cellSize - inset * 2);
    graphics
      .roundRect(
        x * this.cellSize + inset,
        y * this.cellSize + inset,
        size,
        size,
        Math.min(4, this.cellSize * 0.16),
      )
      .fill(PIECE_COLORS[type])
      .stroke({ color: 0xffffff, alpha: 0.28, width: Math.max(1, this.cellSize * 0.035) });
  }
}