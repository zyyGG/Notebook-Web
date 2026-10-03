import * as PIXI from "pixi.js";
import { PIECE_COLORS, PIECE_SHAPES } from "./const";
import type { PieceType } from "./type";

export default class NextPiecePreview extends PIXI.Container {
  private readonly graphics = new PIXI.Graphics();
  private previewWidth: number;
  private previewHeight: number;

  constructor(width: number, height: number) {
    super();
    this.previewWidth = width;
    this.previewHeight = height;
    this.addChild(this.graphics);
  }

  resize(width: number, height: number) {
    this.previewWidth = width;
    this.previewHeight = height;
  }

  draw(type: PieceType | null) {
    this.graphics.clear();
    if (!type) return;

    const shape = PIECE_SHAPES[type];
    const cells = shape.flatMap((row, y) => row.flatMap((filled, x) => filled ? [{ x, y }] : []));
    if (cells.length === 0) return;

    const minX = Math.min(...cells.map((cell) => cell.x));
    const maxX = Math.max(...cells.map((cell) => cell.x));
    const minY = Math.min(...cells.map((cell) => cell.y));
    const maxY = Math.max(...cells.map((cell) => cell.y));
    const cellSize = Math.max(8, Math.min(18, this.previewWidth / (maxX - minX + 1), this.previewHeight / (maxY - minY + 1)));
    const pieceWidth = (maxX - minX + 1) * cellSize;
    const pieceHeight = (maxY - minY + 1) * cellSize;
    const offsetX = (this.previewWidth - pieceWidth) / 2;
    const offsetY = (this.previewHeight - pieceHeight) / 2;
    const inset = Math.max(1, cellSize * 0.06);

    cells.forEach(({ x, y }) => {
      this.graphics
        .roundRect(
          offsetX + (x - minX) * cellSize + inset,
          offsetY + (y - minY) * cellSize + inset,
          cellSize - inset * 2,
          cellSize - inset * 2,
          Math.min(4, cellSize * 0.16),
        )
        .fill(PIECE_COLORS[type])
        .stroke({ color: 0xffffff, alpha: 0.32, width: Math.max(1, cellSize * 0.04) });
    });
  }
}