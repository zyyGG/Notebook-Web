# v2 控件使用说明

这组控件基于 PixiJS 8，用 `options({...})` 设置属性，并返回当前实例以支持链式调用。入口文件目前没有统一导出，请从具体文件导入：

```ts
import Root from "../components/v2/Root";
import Container from "../components/v2/Container";
import Button from "../components/v2/Button";
import Text from "../components/v2/Text";
```

## 快速开始

`Root` 接收 PixiJS Application 配置和用于挂载 canvas 的 `HTMLDivElement`。Application 初始化是异步的；初始化完成前调用 `add()` 会先排队，不必额外等待。

```ts
const root = new Root(
	{
		background: "#3e3e3e",
		resizeTo: canvas,
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
	},
	canvas,
);

root.add(
	new Container()
		.options({ width: 320, height: 120, padding: [16, 20] })
		.add(
			new Button()
				.options({ x: 0, y: 0, background: 0x315c48 })
				.add(new Text().options({ text: "开始游戏", textColor: 0xffffff })),
		),
);
```

## 控件

### Root

```ts
new Root(appOptions, canvas).add(container1, container2);
```

- `appOptions`：传给 `PIXI.Application.init()` 的配置。
- `canvas`：将 PixiJS canvas 插入的 HTML `div`。
- `add(...containers)`：把一个或多个 `Container` 添加到 PixiJS stage，返回 `Root`。
- `options()`：目前尚未实现，不要用它设置属性。

### Container

```ts
new Container()
	.options({ x: 20, y: 30, width: 320, height: 180, background: 0x202830, padding: 16 })
	.add(child1, child2);
```

`options()` 可设置 `x`、`y`、`width`、`height`、`background` 和 `padding`。默认最小尺寸为 `100 x 100`；未显式指定的宽高会在添加/更新子项时按内容边界和 padding 自动扩展。显式指定的维度保持固定。背景为 `0xff000033`，背景图形有固定的 8px 圆角。

`add(...children)` 接收 PixiJS `Container` 对象，包括 `Container`、`HContainer`、`Button`、自定义 `Text` 和 `Sprite`。子控件的 `x/y` 是相对于父容器内容区的局部坐标；父级位置通过 PixiJS 容器变换自然累积。添加子控件或更新 options 后，会先从树顶递归计算布局，再递归绘制。

`Rectangle` 和 `Text` 是原生 PixiJS Container。需要使用控件树布局时，用 `add()` 添加；也可以用 PixiJS 自带的 `addChild()` 手动管理：

```ts
const panel = new Container().options({ width: 240, height: 100 });
panel.addChild(new Rectangle().options({ width: 240, height: 100, background: 0x202830 }));
panel.addChild(new Text().options({ x: 12, y: 12, text: "标题" }));
root.add(panel);
```

### Button

```ts
new Button().options({
	x: 0,
	y: 0,
	width: 140,
	height: 44,
	background: 0x315c48,
	padding: [8, 16],
	onClick: (event) => console.log("clicked", event),
});
```

Button 不管理文字和字体，只负责背景、命中区域及点击事件。支持 `x`、`y`、`width`、`height`、`background`、`padding` 和 `onClick`。未指定宽高时，根据子项边界与内边距自动计算，最小尺寸为 `64 x 28`；显式指定后，该维度保持固定。

Button 可以像 Container 一样接收文本、图片或其他 PixiJS Container 子项。它会保留添加的内容，并按子项边界与 padding 计算按钮尺寸：

```ts
import { Sprite } from "pixi.js";

new Button()
	.options({ padding: 8 })
	.add(
		new Text().options({ text: "确认", fontSize: 18 }),
		Sprite.from("/assets/confirm.png"),
	);
```

`onClick` 绑定 PixiJS `pointertap` 事件。传入 `null` 可移除回调；有回调时 Button 会启用静态事件模式并显示 pointer 光标。

### Rectangle

```ts
new Rectangle().options({ x: 0, y: 0, width: 120, height: 60, background: "#ffffff" });
```

支持 `x`、`y`、`width`、`height`、`background`；默认大小为 `100 x 100`，背景为白色。它继承自 `PIXI.Container`，可用 PixiJS 的 `addChild()` 添加到其他容器。

### Text

```ts
new Text().options({
	x: 12,
	y: 8,
	text: "得分：100",
	fontSize: 18,
	textColor: 0xffffff,
	textWeight: "bold",
});
```

支持 `x`、`y`、`text`、`fontSize`、`textColor` 和 `textWeight`。默认文字为 `Text`，字号 16，黑色，常规字重。它同样使用 PixiJS 的 `addChild()` 添加。

### Padding

`Container` 和 `Button` 的 `padding` 支持数字、数组或 `Padding` 实例：

```ts
padding: 12             // 上右下左均为 12
padding: [8, 16]        // 上下 8，左右 16
padding: [8, 16, 12, 20] // 上、右、下、左
```

也可以直接使用 `new Padding().set(...)`；`set()` 支持 1、2 或 4 个数字，或一个长度为 1、2 或 4 的数组。

### HContainer 和 Toast

- `HContainer` 按 `_children` 顺序水平排列，支持继承自 `Container` 的 options，以及额外的 `spacing`。每个子项的位置由左/上 padding、前面子项的宽度、间距和子项自身 `x/y` 计算；间距只出现在子项之间。
- `VContainer` 按 `_children` 顺序垂直排列，`spacing` 是子项之间的垂直间距；`align` 控制子项在交叉轴上的水平对齐（`start`、`center`、`end`）。
- `Toast` 通过 Root 挂载到 PixiJS stage，在画面顶部居中堆叠显示，并于 3 秒后自动消失。支持以下静态方法：

```ts
import Toast from "../components/v2/Toast";

Toast.message("显示文本");
Toast.success("成功文本");
Toast.error("错误文本");
Toast.warn("警告文本");
```

## 注意事项

- `options()` 使用空值合并，数值 `0` 和空字符串可作为有效值。
- `Root.add()` 只接收自定义 `Container`；不要直接传入 `Button`、`Rectangle` 或 `Text`。