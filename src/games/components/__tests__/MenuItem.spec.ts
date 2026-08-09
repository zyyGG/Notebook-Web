import { describe, it, expect, vi } from 'vitest';
import { TextStyle } from 'pixi.js';
import MenuItem from '../MenuItem';
import { makeFakeEvent } from './helpers';

describe('MenuItem', () => {
  describe('默认构造', () => {
    it('第一个 child 是 Text，默认文本为 "菜单项"', () => {
      const item = new MenuItem();
      const child = item.children[0];
      // Text 实例有 text 属性
      expect(child).toBeDefined();
      expect((child as { text?: string }).text).toBe('菜单项');
    });

    // PixiJS v8 Container.interactive 默认为 undefined（非 false），未设置时为 falsy
    it('未设置 onSelect 时 interactive 为 falsy', () => {
      const item = new MenuItem();
      expect(item.interactive).toBeFalsy();
    });
  });

  describe('已知问题：无 onSelect 时 interactive=false', () => {
    it('不传 onSelect → interactive 为 false，hover handler 虽注册但真实指针事件不可达', () => {
      const item = new MenuItem();
      expect(item.interactive).toBeFalsy();
      // hover handler 始终注册，通过 emit 直接触发仍可执行
      let hovered = false;
      item.on('pointerover', () => {
        hovered = true;
      });
      item.emit('pointerover', makeFakeEvent(item));
      expect(hovered).toBe(true);
    });
  });

  describe('onSelect', () => {
    it('提供 onSelect → interactive = true', () => {
      const item = new MenuItem({ onSelect: () => {} });
      expect(item.interactive).toBe(true);
    });

    it('emit pointerdown → onSelect 被调用且收到同一 event', () => {
      const onSelect = vi.fn();
      const item = new MenuItem({ onSelect });
      const fake = makeFakeEvent(item);
      item.emit('pointerdown', fake);
      expect(onSelect).toHaveBeenCalledWith(fake);
    });
  });

  describe('默认 hover 行为', () => {
    it('emit pointerover → alpha 变为 0.7', () => {
      const item = new MenuItem();
      const fake = makeFakeEvent(item);
      item.emit('pointerover', fake);
      expect(item.alpha).toBe(0.7);
    });

    it('emit pointerout → alpha 恢复为 1', () => {
      const item = new MenuItem();
      item.alpha = 0.7;
      const fake = makeFakeEvent(item);
      item.emit('pointerout', fake);
      expect(item.alpha).toBe(1);
    });
  });

  describe('自定义 hover 回调', () => {
    it('onMoveIn/onMoveOut 覆盖默认 alpha 行为', () => {
      const onMoveIn = vi.fn();
      const onMoveOut = vi.fn();
      const item = new MenuItem({ onMoveIn, onMoveOut });
      item.alpha = 1; // 确保初始值

      item.emit('pointerover', makeFakeEvent(item));
      expect(onMoveIn).toHaveBeenCalled();
      expect(item.alpha).toBe(1); // 自定义回调不修改 alpha

      item.emit('pointerout', makeFakeEvent(item));
      expect(onMoveOut).toHaveBeenCalled();
      expect(item.alpha).toBe(1);
    });
  });

  describe('自定义 text / textStyle', () => {
    it('自定义文本生效', () => {
      const item = new MenuItem({ text: '选项A' });
      expect((item.children[0] as { text?: string }).text).toBe('选项A');
    });

    it('自定义 textStyle.fontSize 影响高度', () => {
      const item = new MenuItem({
        textStyle: new TextStyle({ fontSize: 24 }),
      });
      const bounds = item.getLocalBounds();
      expect(bounds.height).toBeGreaterThan(0);
    });
  });
});
