import { describe, it, expect } from 'vitest';
import Menu from '../Menu';
import MenuItem from '../MenuItem';
import { makeFakeEvent } from './helpers';

describe('Menu', () => {
  describe('默认构造', () => {
    it('buttonContainer 是 Button 且默认文本 "菜单"', () => {
      const menu = new Menu();
      expect(menu.buttonContainer).toBeDefined();
      expect(menu.buttonContainer.textSprite.text).toBe('菜单');
    });

    it('menuContainer 存在且初始不可见', () => {
      const menu = new Menu();
      expect(menu.menuContainer).toBeDefined();
      expect(menu.menuVisible).toBe(false);
    });
  });

  describe('setMenuVisible / menuVisible getter', () => {
    it('setMenuVisible(true) → getter 返回 true', () => {
      const menu = new Menu();
      menu.setMenuVisible(true);
      expect(menu.menuVisible).toBe(true);
    });

    it('setMenuVisible(false) → getter 返回 false', () => {
      const menu = new Menu();
      menu.setMenuVisible(true);
      menu.setMenuVisible(false);
      expect(menu.menuVisible).toBe(false);
    });
  });

  describe('触发按钮切换', () => {
    it('buttonContainer emit pointerdown → menuVisible toggle', () => {
      const menu = new Menu();
      expect(menu.menuVisible).toBe(false);

      menu.buttonContainer.emit('pointerdown', makeFakeEvent());
      expect(menu.menuVisible).toBe(true);

      menu.buttonContainer.emit('pointerdown', makeFakeEvent());
      expect(menu.menuVisible).toBe(false);
    });
  });

  describe('menuPosition 8 方向布局', () => {
    const menuItem = new MenuItem({ text: '选项' });

    const positions: Array<{
      pos: NonNullable<Menu['menuPosition']>;
      expectedX: (bw: number, _bh: number, mw: number, _mh: number) => number;
      expectedY: (bw: number, bh: number, mw: number, mh: number) => number;
    }> = [
      {
        pos: 'buttom_left',
        expectedX: () => 0,
        expectedY: (_bw, bh) => bh,
      },
      {
        pos: 'buttom_right',
        expectedX: (bw, _bh, mw) => bw - mw,
        expectedY: (_bw, bh) => bh,
      },
      {
        pos: 'top_left',
        expectedX: () => 0,
        expectedY: (_bw, _bh, _mw, mh) => -mh,
      },
      {
        pos: 'top_right',
        expectedX: (bw, _bh, mw) => bw - mw,
        expectedY: (_bw, _bh, _mw, mh) => -mh,
      },
      {
        pos: 'left_top',
        expectedX: (_bw, _bh, mw) => -mw,
        expectedY: () => 0,
      },
      {
        pos: 'left_buttom',
        expectedX: (_bw, _bh, mw) => -mw,
        expectedY: (_bw, bh, _mw, mh) => bh - mh,
      },
      {
        pos: 'right_top',
        expectedX: (bw) => bw,
        expectedY: () => 0,
      },
      {
        pos: 'right_buttom',
        expectedX: (bw) => bw,
        expectedY: (_bw, bh, _mw, mh) => -mh + bh,
      },
    ];

    for (const { pos, expectedX, expectedY } of positions) {
      it(`menuPosition="${pos}" → 菜单容器位置公式正确`, () => {
        const menu = new Menu({
          menuPosition: pos,
          menuItems: [menuItem],
        });

        const bw = menu.buttonContainer.width;
        const bh = menu.buttonContainer.height;
        const mw = (menu as unknown as Record<string, number>)['_menuWidth'] ?? 0;
        const mh = (menu as unknown as Record<string, number>)['_menuHeight'] ?? 0;

        const ex = expectedX(bw, bh, mw, mh);
        const ey = expectedY(bw, bh, mw, mh);

        expect(menu.menuContainer.position.x).toBeCloseTo(ex, 1);
        expect(menu.menuContainer.position.y).toBeCloseTo(ey, 1);
      });
    }
  });

  describe('_onUpdate 位置追踪', () => {
    it('修改 menu.position 后 menuContainer 位置重新计算', () => {
      const item = new MenuItem({ text: 'X' });
      const menu = new Menu({
        menuPosition: 'buttom_left',
        menuItems: [item],
      });

      const bw = menu.buttonContainer.width;
      const bh = menu.buttonContainer.height;

      // 初始位置：buttom_left → (0, bh)
      expect(menu.menuContainer.position.x).toBeCloseTo(0, 1);
      expect(menu.menuContainer.position.y).toBeCloseTo(bh, 1);

      // 移动 Menu 容器本身触发 _onUpdate
      menu.position.set(100, 50);

      // menuContainer 相对于 Menu 的位置不变（_onUpdate 作用不是跟随 position 偏移，
      // 而是在 position 变化时重新确认当前 menuPosition 下的 menuContainer 相对位置）
      expect(menu.menuContainer.position.x).toBeCloseTo(0, 1);
      expect(menu.menuContainer.position.y).toBeCloseTo(bh, 1);
    });
  });

  describe('menuItems 布局', () => {
    it('3 个 MenuItem 按 index 堆叠，初始均不可见', () => {
      const items = [
        new MenuItem({ text: 'A' }),
        new MenuItem({ text: 'B' }),
        new MenuItem({ text: 'C' }),
      ];
      const menu = new Menu({ menuItems: items });

      // background + 3 items
      expect(menu.menuContainer.children.length).toBe(4);
      expect(menu.menuContainer.visible).toBe(false);

      // 每个 item 的 y = 12 + index * (item.height + 16)
      const itemHeight = items[0].height;
      for (let i = 0; i < 3; i++) {
        const itemChild = menu.menuContainer.children[i + 1]; // children[0] 是 bg
        expect(itemChild.position.x).toBe(12);
        expect(itemChild.position.y).toBe(12 + i * (itemHeight + 16));
      }
    });
  });

  describe('无 menuItems', () => {
    it('不传 menuItems → 不抛错，setMenuVisible 仍可用', () => {
      const menu = new Menu();
      expect(() => menu.setMenuVisible(true)).not.toThrow();
      expect(menu.menuVisible).toBe(true);
    });
  });

  describe('空数组 menuItems: [] vs 不传', () => {
    it('menuItems: [] 时菜单宽 = 80 + 24（Math.max(..., 80) 生效）', () => {
      const menu = new Menu({ menuItems: [] });
      const mw = (menu as unknown as Record<string, number>)['_menuWidth'];
      // 空数组下 Math.max(...items.map(i=>i.width), 80) 返回 80
      // 菜单整体宽 = 80 + padding*2 = 80 + 24 = 104
      expect(mw).toBe(104);
    });

    it('不传 menuItems → _menuWidth 为 0（跳过整个 menuItems 分支）', () => {
      const menu = new Menu();
      const mw = (menu as unknown as Record<string, number>)['_menuWidth'];
      expect(mw).toBe(0);
    });
  });

  describe('menuPosition getter / setter', () => {
    it('getter 返回当前值', () => {
      const menu = new Menu({ menuPosition: 'right_top' });
      expect(menu.menuPosition).toBe('right_top');
    });

    it('setter 触发 _updateLayout', () => {
      const item = new MenuItem({ text: 'X' });
      const menu = new Menu({ menuItems: [item] });
      const bw = menu.buttonContainer.width;

      menu.menuPosition = 'right_top';
      expect(menu.menuContainer.position.x).toBeCloseTo(bw, 1);
      expect(menu.menuContainer.position.y).toBeCloseTo(0, 1);
    });
  });

  describe('自定义 buttonOptions', () => {
    it('自定义文本生效', () => {
      const menu = new Menu({ buttonOptions: { text: '打开' } });
      expect(menu.buttonContainer.textSprite.text).toBe('打开');
    });
  });
});
