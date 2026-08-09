import { describe, it, expect, vi } from 'vitest';
import { Graphics, Color } from 'pixi.js';
import Button from '../Button';
import { makeFakeEvent } from './helpers';

/**
 * 获取 Button 内容器宽高的辅助函数。
 * 注意：这些值来自 Text 测量 + padding，在 mock 下是确定性的。
 */
function buttonDims(btn: Button) {
  const textW = btn.textSprite.width;
  const textH = btn.textSprite.height;
  const px = btn.options.padding?.x ?? 14;
  const py = btn.options.padding?.y ?? 4;
  return {
    w: textW + px * 2,
    h: textH + py * 2,
  };
}

describe('Button', () => {
  describe('默认构造', () => {
    it('children[0] 是背景 Graphics，children[1] 是 Text', () => {
      const btn = new Button();
      expect(btn.children[0]).toBeInstanceOf(Graphics);
      const textChild = btn.children[1] as { text?: string };
      expect(textChild.text).toBe(' ');
    });

    it('pivot 居中 = ((textW+28)/2, (textH+8)/2)', () => {
      const btn = new Button();
      const { w, h } = buttonDims(btn);
      expect(btn.pivot.x).toBe(w / 2);
      expect(btn.pivot.y).toBe(h / 2);
    });

    // PixiJS v8 Container.interactive 默认 undefined，未设置时 falsy
    it('默认无 handler 时 interactive 为 falsy', () => {
      const btn = new Button();
      expect(btn.interactive).toBeFalsy();
    });
  });

  describe('text setter', () => {
    it('修改 text → textSprite.text 更新', () => {
      const btn = new Button({ text: 'Hello' });
      btn.text = 'World';
      expect(btn.textSprite.text).toBe('World');
    });

    it('修改 text → 背景尺寸跟随缩放', () => {
      const btn = new Button({ text: 'Hi' });
      btn.text = 'LongerText';
      const bg = btn.children[0] as Graphics;
      const { w, h } = buttonDims(btn);
      expect(bg.width).toBe(w);
      expect(bg.height).toBe(h);
    });
  });

  describe('background setter', () => {
    it('设置新背景 → 新 Graphics 插入 children[0]', () => {
      const btn = new Button();
      const oldBg = btn.children[0];
      btn.background = 0xff0000;
      const newBg = btn.children[0];
      expect(newBg).toBeInstanceOf(Graphics);
      expect(newBg).not.toBe(oldBg);
    });

    it('新背景尺寸匹配文本+padding', () => {
      const btn = new Button({ text: 'OK' });
      btn.background = 0x00ff00;
      const bg = btn.children[0] as Graphics;
      const { w, h } = buttonDims(btn);
      expect(bg.width).toBe(w);
      expect(bg.height).toBe(h);
    });
  });

  describe('事件', () => {
    it('onClick → interactive = true，emit pointerdown 触发', () => {
      const onClick = vi.fn();
      const btn = new Button({ onClick });
      expect(btn.interactive).toBe(true);

      const fake = makeFakeEvent(btn);
      btn.emit('pointerdown', fake);
      expect(onClick).toHaveBeenCalledWith(fake);
    });

    it('onUp → emit pointerup 触发', () => {
      const onUp = vi.fn();
      const btn = new Button({ onUp });
      const fake = makeFakeEvent(btn);
      btn.emit('pointerup', fake);
      expect(onUp).toHaveBeenCalledWith(fake);
    });

    it('已知问题：onClick 与 onDown 都绑 pointerdown → 一次 emit 双触发', () => {
      const onClick = vi.fn();
      const onDown = vi.fn();
      const btn = new Button({ onClick, onDown });

      btn.emit('pointerdown', makeFakeEvent(btn));
      expect(onClick).toHaveBeenCalled();
      expect(onDown).toHaveBeenCalled();
      // 两者都被调用是当前实现的行为，非设计意图
    });
  });

  describe('padding', () => {
    it('默认 padding 下 textSprite 偏移 (14, 4)', () => {
      const btn = new Button();
      expect(btn.textSprite.x).toBe(14);
      expect(btn.textSprite.y).toBe(4);
    });

    it('自定义 padding 生效', () => {
      const btn = new Button({ padding: { x: 20, y: 10 } });
      expect(btn.textSprite.x).toBe(20);
      expect(btn.textSprite.y).toBe(10);
    });

    it('部分 padding 使用默认值', () => {
      const btn = new Button({ padding: { x: 8 } });
      expect(btn.textSprite.x).toBe(8);
      expect(btn.textSprite.y).toBe(4); // 默认
    });
  });

  describe('pivotPosition 9 方向', () => {
    const positions: Array<{
      pos: NonNullable<Button['options']['pivotPosition']>;
      expected: (w: number, h: number) => [number, number];
    }> = [
      { pos: 'leftTop', expected: (_w, _h) => [0, 0] },
      { pos: 'top', expected: (w, _h) => [w / 2, 0] },
      { pos: 'rightTop', expected: (w, _h) => [w, 0] },
      { pos: 'right', expected: (w, h) => [w, h / 2] },
      { pos: 'rightBottom', expected: (w, h) => [w, h] },
      { pos: 'bottom', expected: (w, h) => [w / 2, h] },
      { pos: 'leftBottom', expected: (_w, h) => [0, h] },
      { pos: 'left', expected: (_w, h) => [0, h / 2] },
      { pos: 'center', expected: (w, h) => [w / 2, h / 2] },
    ];

    for (const { pos, expected } of positions) {
      it(`pivotPosition="${pos}"`, () => {
        const btn = new Button({ pivotPosition: pos });
        const { w, h } = buttonDims(btn);
        const [ex, ey] = expected(w, h);
        expect(btn.pivot.x).toBeCloseTo(ex, 1);
        expect(btn.pivot.y).toBeCloseTo(ey, 1);
      });
    }
  });

  describe('潜在 bug：background 边界值', () => {
    it('background: "transparent" 被 Color 静默解析为透明色（类型与实现不符：Background 类型含 "transparent" 但 Color 不会抛错）', () => {
      const btn = new Button({ text: 'X' });
      // PixiJS v8 Color 会尝试解析 "transparent" 为 CSS 颜色名，不抛错
      // 但这不意味着 Background 类型设计合理 —— "transparent" 是字符串字面量而非常规颜色值
      expect(() => {
        btn.background = 'transparent';
      }).not.toThrow();
    });

    it('background: Color 实例不抛错', () => {
      const btn = new Button({ text: 'X' });
      expect(() => {
        btn.background = new Color(0xff0000);
      }).not.toThrow();
    });
  });

  describe('round / 自定义 textStyle', () => {
    it('round 参数不影响构造', () => {
      expect(() => new Button({ round: 8 })).not.toThrow();
    });

    it('自定义 textStyle 生效', () => {
      const btn = new Button({
        text: 'Bold',
        textStyle: { fontSize: 24, fontWeight: 'bold' },
      });
      expect(btn.textSprite.text).toBe('Bold');
    });
  });
});
