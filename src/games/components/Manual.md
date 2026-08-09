# 游戏 UI 组件库

基于 PixiJS v8 `Container` 的标准 UI 组件，所有组件构造函数均为同步调用。

---

## Button

标准按钮组件，继承 `Container`。

### 参数 `ButtonOptions`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `" "` | 按钮文本 |
| `textStyle` | `TextStyleOptions` | `{ fill: 0xffffff, fontSize: 18, fontWeight: "bold" }` | 文本样式 |
| `background` | `Color \| number \| "transparent"` | `0x333333` | 背景颜色，`undefined` 时不绘制背景 |
| `padding` | `{ x?: number, y?: number }` | `{ x: 14, y: 4 }` | 文本内边距 |
| `round` | `number` | `0` | 背景圆角半径 |
| `pivotPosition` | `"leftTop" \| "top" \| "rightTop" \| "right" \| "rightBottom" \| "bottom" \| "leftBottom" \| "left" \| "center"` | `"center"` | 锚点（pivot）位置 |
| `onClick` | `(e: FederatedPointerEvent) => void` | - | 点击回调（绑 `pointerdown`） |
| `onDown` | `(e: FederatedPointerEvent) => void` | - | 按下回调（**也与 `onClick` 同绑 `pointerdown`**） |
| `onUp` | `(e: FederatedPointerEvent) => void` | - | 松开回调（绑 `pointerup`） |

> **已知问题**：`onClick` 和 `onDown` 都绑定 `pointerdown` 事件，同时提供时会双触发。

### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `textSprite` | `Text` | 文本精灵，可直接修改 `textSprite.text` |
| `options` | `ButtonOptions` | 构造参数引用 |

### Setter

| Setter | 说明 |
|--------|------|
| `text` | 设置文本内容，同时更新背景尺寸 |
| `background` | 设置背景颜色，销毁旧 Graphics，创建新 Graphics |

### 示例

```ts
import Button from "./components/Button";

// 基本按钮
const btn = new Button({ text: "开始游戏", onClick: () => console.log("click") });
app.stage.addChild(btn);

// 带圆角 + 自定义样式
const btn2 = new Button({
  text: "确认",
  textStyle: { fill: 0xffffff, fontSize: 20 },
  background: 0x4a90d9,
  round: 8,
  padding: { x: 20, y: 8 },
  pivotPosition: "leftTop",
  onClick: () => { /* ... */ },
});
btn2.position.set(100, 200);

// 动态修改文本
btn.text = "重新开始";
```

---

## Dialog

标准对话框组件，继承 `Container`，包含标题区、内容区、底部按钮区。

### 参数 `DialogOptions`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `400` | 对话框宽度 |
| `height` | `number` | `320` | 对话框高度 |
| `background` | `Color \| number` | `0xffffff` | 背景颜色 |
| `round` | `number` | `12` | 背景圆角 |
| `header` | `boolean` | `true` | 是否显示标题区域 |
| `headerTitle` | `string` | `"标题"` | 标题文本（仅默认 header 有效） |
| `headerContainer` | `Container` | - | 自定义标题区域容器，传入后替换默认 header |
| `contentContainer` | `Container` | - | 自定义内容区域容器 |
| `footer` | `boolean` | `true` | 是否显示底部按钮区域 |
| `footerContainer` | `Container` | - | 自定义底部区域容器，传入后替换默认 footer |
| `onConfirm` | `() => void` | - | 点击"确定"按钮回调 |
| `onCancel` | `() => void` | - | 点击"取消"按钮回调 |

> **已知问题**：`header` / `footer` 使用 `||` 而非 `??` 判断默认值，传入 `false` 时会被默认值 `true` 覆盖，无法关闭对应区域。

### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | `"Dialog"`，用于标识 |

### 行为说明

- 默认 header 包含标题文本 + 关闭按钮（"X"），点击关闭按钮 → `visible = false`
- 默认 footer 包含确定（"确定"）和取消（"取消"）两个 `Button`
- 默认取消按钮点击 → `visible = false`；若传入 `onCancel`，则仅执行回调不自动隐藏
- 确定按钮点击仅执行 `onConfirm`，不自动关闭
- `zIndex = 99999`，确保在最上层
- pivot 居中（`width / 2, height / 2`）

### 示例

```ts
import Dialog from "./components/Dialog";
import { Container, Graphics } from "pixi.js";

// 基本确认框
const dialog = new Dialog({
  headerTitle: "确认删除",
  onConfirm: () => {
    console.log("已确认");
    dialog.visible = false;
  },
});
app.stage.addChild(dialog);

// 自定义内容
const content = new Container();
const dot = new Graphics();
dot.circle(0, 0, 8);
dot.fill(0xff0000);
content.addChild(dot);

const dialog2 = new Dialog({
  width: 300,
  height: 200,
  headerTitle: "提示",
  contentContainer: content,
  footer: false, // 不显示底部按钮（注意：已知 bug，不生效）
  onCancel: () => { dialog2.visible = false; },
});
app.stage.addChild(dialog2);
```

---

## Menu

菜单组件，包含一个触发按钮和一个下拉菜单列表，点击按钮切换菜单显示/隐藏。

### 参数 `MenuOptions`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `menuPosition` | `"buttom_left" \| "buttom_right" \| "top_left" \| "top_right" \| "left_top" \| "left_buttom" \| "right_top" \| "right_buttom"` | `"buttom_left"` | 菜单相对按钮的弹出位置，如 `buttom_left` 表示菜单在按钮下方、左对齐 |
| `buttonOptions` | `ButtonOptions` | `{ text: "菜单", background: 0x333333, onClick: toggle, pivotPosition: "center" }` | 触发按钮的配置 |
| `menuItems` | `MenuItem[]` | - | 菜单项列表 |

### 实例属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `buttonContainer` | `Button` | 触发按钮实例 |
| `menuContainer` | `Container` | 菜单列表容器 |
| `menuVisible` | `boolean` (getter) | 菜单是否可见 |
| `menuPosition` | `menuPosition` (getter/setter) | 菜单弹出位置，setter 触发布局重算 |

### 方法

| 方法 | 说明 |
|------|------|
| `setMenuVisible(visible: boolean)` | 设置菜单可见性 |

### 位置说明

`menuPosition` 命名规则：`{菜单位置}_{对齐方式}`

| 值 | 菜单位置 | 对齐 |
|----|----------|------|
| `buttom_left` | 按钮下方 | 菜单左对齐按钮左 |
| `buttom_right` | 按钮下方 | 菜单右对齐按钮右 |
| `top_left` | 按钮上方 | 菜单左对齐按钮左 |
| `top_right` | 按钮上方 | 菜单右对齐按钮右 |
| `left_top` | 按钮左侧 | 菜单顶对齐按钮顶 |
| `left_buttom` | 按钮左侧 | 菜单底对齐按钮底 |
| `right_top` | 按钮右侧 | 菜单顶对齐按钮顶 |
| `right_buttom` | 按钮右侧 | 菜单底对齐按钮底 |

> **已知问题**：位置类型中的 `buttom` 为拼写错误（应为 `bottom`），已固定在公开 API 中。

### 示例

```ts
import Menu from "./components/Menu";
import MenuItem from "./components/MenuItem";

const items = [
  new MenuItem({ text: "新游戏", onSelect: () => startNewGame() }),
  new MenuItem({ text: "存档", onSelect: () => saveGame() }),
  new MenuItem({ text: "退出", onSelect: () => exitGame() }),
];

const menu = new Menu({
  menuPosition: "buttom_left",
  buttonOptions: { text: "菜单", pivotPosition: "leftTop" },
  menuItems: items,
});
menu.position.set(10, 10);
app.stage.addChild(menu);
```

---

## MenuItem

菜单项组件，包含文本和交互行为。

### 参数 `MenuItemOptions`

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `"菜单项"` | 菜单项文本 |
| `textStyle` | `TextStyle` | `{ fill: 0xffffff, fontSize: 18 }` | 文本样式（完整 TextStyle 对象） |
| `onSelect` | `(event: FederatedEvent) => void` | - | 选中回调（绑 `pointerdown`） |
| `onMoveIn` | `(event: FederatedEvent) => void` | - | 鼠标移入回调，提供后覆盖默认 hover 效果 |
| `onMoveOut` | `(event: FederatedEvent) => void` | - | 鼠标移出回调，提供后覆盖默认 hover 效果 |

### 默认行为

- **hover**：`pointerover` → `alpha = 0.7`；`pointerout` → `alpha = 1`
- **如果提供 `onMoveIn` / `onMoveOut`**，默认 alpha 效果被跳过
- `interactive = true` 仅在提供 `onSelect` 时设置

> **已知问题**：hover handler 始终注册，但 `interactive` 只在提供 `onSelect` 时开启。不传 `onSelect` 时，hover 效果不会通过真实指针事件触发（PixiJS v8 不向非 interactive 对象派发指针事件），但可以通过 `emit` 手动触发。

### 示例

```ts
import MenuItem from "./components/MenuItem";

const item = new MenuItem({
  text: "选项A",
  onSelect: (e) => {
    console.log("选中了选项A");
  },
});
```
