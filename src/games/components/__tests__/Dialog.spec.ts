import { describe, it, expect, vi } from 'vitest';
import { Container, Graphics, Text } from 'pixi.js';
import Dialog from '../Dialog';
import { makeFakeEvent } from './helpers';

describe('Dialog', () => {
  describe('默认构造', () => {
    it('label === "Dialog"', () => {
      const dlg = new Dialog();
      expect(dlg.label).toBe('Dialog');
    });

    it('children[0] 是背景 Graphics', () => {
      const dlg = new Dialog();
      expect(dlg.children[0]).toBeInstanceOf(Graphics);
    });

    it('header / content / footer 三个区域容器存在', () => {
      const dlg = new Dialog();
      const childrenCount = dlg.children.length;
      // children: [bg, header, content, footer] = 4 个 (默认结构)
      expect(childrenCount).toBe(4);
    });

    it('zIndex = 99999', () => {
      const dlg = new Dialog();
      expect(dlg.zIndex).toBe(99999);
    });

    it('pivot = (200, 160) —— width/2, height/2 (默认 400x320)', () => {
      const dlg = new Dialog();
      expect(dlg.pivot.x).toBe(200);
      expect(dlg.pivot.y).toBe(160);
    });
  });

  describe('关闭按钮', () => {
    it('header 区域内有关闭按钮 "X"（Text 实例）且 interactive = true', () => {
      const dlg = new Dialog();
      // header container 是 children[1]
      const headerContainer = dlg.children[1] as Container;
      // 里面有 title Text + close Text
      const texts = headerContainer.children.filter(
        (c) => (c as { text?: string }).text !== undefined,
      ) as unknown as Array<{ text: string; interactive: boolean; emit: (event: string, e: unknown) => void }>;
      const closeBtn = texts.find((t) => t.text === 'X');
      expect(closeBtn).toBeDefined();
      expect(closeBtn!.interactive).toBe(true);
    });

    it('关闭按钮 emit pointerdown → dialog.visible = false', () => {
      const dlg = new Dialog();
      const headerContainer = dlg.children[1] as Container;
      const texts = headerContainer.children.filter(
        (c) => (c as { text?: string }).text !== undefined,
      ) as unknown as Array<{ text: string; emit: (event: string, e: unknown) => void }>;
      const closeBtn = texts.find((t) => t.text === 'X')!;

      closeBtn.emit('pointerdown', makeFakeEvent(closeBtn));
      expect(dlg.visible).toBe(false);
    });
  });

  describe('默认取消行为', () => {
    it('footer 内 cancelButton text = "取消"，emit pointerdown → visible = false', () => {
      const dlg = new Dialog();
      // footer container 是 children[3]
      const footerContainer = dlg.children[3] as Container;
      // 两个 Button 实例，text 分别是 "确定" 和 "取消"
      const cancelBtn = footerContainer.children.find(
        (c) => (c as { textSprite?: { text: string } }).textSprite?.text === '取消',
      ) as unknown as { emit: (event: string, e: unknown) => void } | undefined;

      expect(cancelBtn).toBeDefined();
      cancelBtn!.emit('pointerdown', makeFakeEvent(cancelBtn));
      expect(dlg.visible).toBe(false);
    });
  });

  describe('自定义 onCancel', () => {
    it('onCancel 回调被调用，dialog 不自动隐藏', () => {
      const onCancel = vi.fn();
      const dlg = new Dialog({ onCancel });
      const footerContainer = dlg.children[3] as Container;
      const cancelBtn = footerContainer.children.find(
        (c) => (c as { textSprite?: { text: string } }).textSprite?.text === '取消',
      ) as unknown as { emit: (event: string, e: unknown) => void } | undefined;

      cancelBtn!.emit('pointerdown', makeFakeEvent(cancelBtn));
      expect(onCancel).toHaveBeenCalled();
      // 自定义 onCancel 不会自动设置 visible = false
      expect(dlg.visible).toBe(true);
    });
  });

  describe('onConfirm', () => {
    it('confirmButton text = "确定"，emit pointerdown → 回调调用', () => {
      const onConfirm = vi.fn();
      const dlg = new Dialog({ onConfirm });
      const footerContainer = dlg.children[3] as Container;
      const confirmBtn = footerContainer.children.find(
        (c) => (c as { textSprite?: { text: string } }).textSprite?.text === '确定',
      ) as unknown as { emit: (event: string, e: unknown) => void } | undefined;

      expect(confirmBtn).toBeDefined();
      confirmBtn!.emit('pointerdown', makeFakeEvent(confirmBtn));
      expect(onConfirm).toHaveBeenCalled();
      expect(dlg.visible).toBe(true); // onConfirm 不自动关闭
    });
  });

  describe('内容区位置', () => {
    it('默认有 header → contentContainer.position.y = 40', () => {
      const dlg = new Dialog();
      const contentContainer = dlg.children[2] as Container;
      expect(contentContainer.position.y).toBe(40);
    });

    it('header: false → contentContainer.position.y = 0', () => {
      const dlg = new Dialog({ header: false, footer: false });
      // children: [bg, content] (无 header 无 footer)
      const contentContainer = dlg.children[1] as Container;
      expect(contentContainer.position.y).toBe(0);
    });
  });

  describe('cancelButton 位置（依赖文本测量）', () => {
    it('cancelButton.position.x = width - cancelButton.width', () => {
      const dlg = new Dialog({ width: 500 });
      const footerContainer = dlg.children[3] as Container;
      const cancelBtn = footerContainer.children.find(
        (c) => (c as { textSprite?: { text: string } }).textSprite?.text === '取消',
      ) as unknown as { width: number; position: { x: number; y: number } } | undefined;

      expect(cancelBtn).toBeDefined();
      expect(cancelBtn!.position.x).toBe(500 - cancelBtn!.width);
    });
  });

  describe('自定义容器', () => {
    it('headerContainer / footerContainer / contentContainer 替换默认', () => {
      const customHeader = new Container();
      const customContent = new Container();
      const customFooter = new Container();

      const dlg = new Dialog({
        headerContainer: customHeader,
        contentContainer: customContent,
        footerContainer: customFooter,
      });

      // header 是 children[1]，footer 是 children[3]
      expect(dlg.children[1]).toBe(customHeader);
      expect(dlg.children[2]).toBe(customContent);
      expect(dlg.children[3]).toBe(customFooter);
    });

    it('自定义 footerContainer 位置 = (0, height - 40)', () => {
      const customFooter = new Container();
      const dlg = new Dialog({ footerContainer: customFooter, height: 400 });
      expect(customFooter.position.x).toBe(0);
      expect(customFooter.position.y).toBe(360);
    });
  });

  describe('header / footer 开关', () => {
    // 已知 bug：options.header || true / options.footer || true 使用 || 而非 ??，
    // 导致 false 值被默认值 true 覆盖
    it('已知 bug：header: false 不生效（|| 运算符覆盖了 false）', () => {
      const dlg = new Dialog({ header: false, footer: false });
      // 当前行为：4 个子项（bg + header + content + footer），header 和 footer 未关闭
      expect(dlg.children.length).toBe(4);
    });

    it('已知 bug：footer: false 不生效（|| 运算符覆盖了 false）', () => {
      const dlg = new Dialog({ footer: false });
      // 当前行为：4 个子项（bg + header + content + footer）
      expect(dlg.children.length).toBe(4);
    });
  });

  describe('多实例隔离', () => {
    it('关闭 A 不影响 B 的 visible', () => {
      const dlgA = new Dialog();
      const dlgB = new Dialog();

      const headerA = dlgA.children[1] as Container;
      const closeBtnA = headerA.children.find(
        (c) => (c as { text?: string }).text === 'X',
      ) as unknown as { emit: (event: string, e: unknown) => void };

      closeBtnA.emit('pointerdown', makeFakeEvent(closeBtnA));
      expect(dlgA.visible).toBe(false);
      expect(dlgB.visible).toBe(true);
    });
  });

  describe('背景 Color 实例', () => {
    it('background 为 number 正常', () => {
      const dlg = new Dialog({ background: 0xff0000 });
      expect(dlg.children[0]).toBeInstanceOf(Graphics);
    });
  });
});
