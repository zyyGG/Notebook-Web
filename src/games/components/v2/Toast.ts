import * as PIXI from "pixi.js";
import gsap from "gsap";

type ToastKind = "message" | "success" | "error" | "warn";
type ToastItem = {
	view: PIXI.Container;
	timer: ReturnType<typeof setTimeout>;
	exitTimer?: ReturnType<typeof setTimeout>;
	hiding?: boolean;
};

const toastColors: Record<ToastKind, { background: number; accent: number }> = {
	message: { background: 0x263238, accent: 0x90a4ae },
	success: { background: 0x1b5e20, accent: 0x69f0ae },
	error: { background: 0xb71c1c, accent: 0xff8a80 },
	warn: { background: 0xe65100, accent: 0xffd180 },
};

export default class Toast {
	private static app?: PIXI.Application;
	private static layer?: PIXI.Container;
	private static items: ToastItem[] = [];
	private static pending: Array<{ kind: ToastKind; text: string }> = [];
	private static readonly duration = 3000;

	static mount(app: PIXI.Application) {
		this.unmount(this.app);

		this.app = app;
		this.layer = new PIXI.Container();
		this.layer.zIndex = 10000;
		app.stage.sortableChildren = true;
		app.stage.addChild(this.layer);

		const pending = this.pending;
		this.pending = [];
		pending.forEach(({ kind, text }) => this.show(kind, text));
	}

	static unmount(app?: PIXI.Application) {
		if (app && this.app !== app) return;
		this.items.forEach((item) => {
			clearTimeout(item.timer);
			if (item.exitTimer) clearTimeout(item.exitTimer);
			gsap.killTweensOf(item.view);
			item.view.destroy({ children: true });
		});
		this.items = [];
		this.layer?.destroy({ children: true });
		this.layer = undefined;
		this.app = undefined;
	}

	static message(text: string) {
		this.show("message", text);
	}

	static success(text: string) {
		this.show("success", text);
	}

	static error(text: string) {
		this.show("error", text);
	}

	static warn(text: string) {
		this.show("warn", text);
	}

	private static show(kind: ToastKind, text: string) {
		if (!this.app || !this.layer) {
			this.pending.push({ kind, text });
			return;
		}

		const maxWidth = Math.max(1, Math.min(520, this.app.screen.width - 32));
		const label = new PIXI.Text({
			text,
			style: {
				fontFamily: "Arial, sans-serif",
				fontSize: 16,
				fill: 0xffffff,
				align: "center",
				wordWrap: true,
				wordWrapWidth: Math.max(1, maxWidth - 32),
			},
		});
		const width = Math.min(maxWidth, Math.max(Math.min(120, maxWidth), label.width + 32));
		const height = label.height + 20;
		const colors = toastColors[kind];

		const background = new PIXI.Graphics()
			.roundRect(0, 0, width, height, 8)
			.fill(colors.background);
		background.roundRect(0, 0, 4, height, 2).fill(colors.accent);
		label.position.set((width - label.width) / 2, (height - label.height) / 2);

		const view = new PIXI.Container();
		view.addChild(background, label);
		this.layer.addChild(view);

		const item: ToastItem = {
			view,
			timer: setTimeout(() => this.remove(item), this.duration),
		};
		this.items.push(item);
		this.layout(item);
	}

	private static remove(item: ToastItem) {
		if (item.hiding) return;
		item.hiding = true;
		gsap.to(item.view, {
			y: item.view.y - 12,
			alpha: 0,
			duration: 0.22,
			ease: "power1.in",
			overwrite: "auto",
			onComplete: () => this.destroy(item),
		});
		item.exitTimer = setTimeout(() => this.destroy(item), 260);
		this.layout();
	}

	private static destroy(item: ToastItem) {
		if (!this.items.includes(item)) return;
		if (item.exitTimer) clearTimeout(item.exitTimer);
		gsap.killTweensOf(item.view);
		this.items = this.items.filter((active) => active !== item);
		item.view.destroy({ children: true });
	}

	private static layout(entering?: ToastItem) {
		if (!this.app || !this.layer) return;

		let y = 24;
		this.items.filter((item) => !item.hiding).forEach((item) => {
			const { view } = item;
			const x = (this.app!.screen.width - view.width) / 2;
			if (item === entering) {
				gsap.fromTo(view, {
					x,
					y: y - 14,
					alpha: 0,
				}, {
					x,
					y,
					alpha: 1,
					duration: 0.24,
					ease: "power2.out",
					overwrite: "auto",
				});
			} else {
				gsap.to(view, {
					x,
					y,
					duration: 0.2,
					ease: "power2.out",
					overwrite: "auto",
				});
			}
			y += view.height + 10;
		});
	}
}
