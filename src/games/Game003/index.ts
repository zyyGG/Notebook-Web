import gsap from "gsap";
import { loadConfig, saveConfig } from "../utils";
import Button from "../components/v2/Button";
import Container from "../components/v2/Container";
import HContainer from "../components/v2/HContainer";
import Root from "../components/v2/Root";
import Text from "../components/v2/Text";
import Toast from "../components/v2/Toast";
import VContainer from "../components/v2/VContainer";
import Board from "./Board";
import NextPiecePreview from "./NextPiecePreview";
import { DEFAULT_CONFIG } from "./const";
import { createGameState, hardDrop, movePiece, pauseGame, resumeGame, rotatePiece, softDrop, startGame } from "./logic";
import type { GameConfig, Piece, StepResult } from "./type";

const GAME_CONFIG_KEY = "eluosifangkuai";
const HIGH_SCORE_KEY = `${GAME_CONFIG_KEY}_highScore`;
const SCREEN_PADDING = 14;
const SECTION_GAP = 10;
const STATS_HEIGHT = 44;
const CONTROL_HEIGHT = 50;

export default async function initGame(canvas: HTMLDivElement): Promise<() => void> {
	const storedConfig = loadConfig<GameConfig>(GAME_CONFIG_KEY, DEFAULT_CONFIG);
	const config: GameConfig = {
		rows: boundedInteger(storedConfig.rows, DEFAULT_CONFIG.rows, 10, 30),
		cols: boundedInteger(storedConfig.cols, DEFAULT_CONFIG.cols, 8, 14),
		interval: boundedInteger(storedConfig.interval, DEFAULT_CONFIG.interval, 120, 3000),
	};
	let highScore = boundedInteger(loadConfig<number>(HIGH_SCORE_KEY, 0), 0, 0, Number.MAX_SAFE_INTEGER);

	const root = new Root({
		background: "#17212b",
		resizeTo: canvas,
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
	}, canvas);
	const app = await root.ready;

	const state = createGameState(config.rows, config.cols);
	const scoreText = createText("分数 0", 16);
	const linesText = createText("消行 0", 16);
	const highScoreText = createText(`最高 ${highScore}`, 16);

	const stats = new HContainer().options({
		width: 300,
		height: STATS_HEIGHT,
		padding: [4, 12],
		spacing: 14,
		align: "center",
		background: 0x273640,
	}).add(scoreText, linesText, highScoreText);

	const boardRenderer = new Board(config.rows, config.cols, 16);
	const boardFrame = new Container().options({
		width: config.cols * 16,
		height: config.rows * 16,
		padding: 0,
		background: 0x101820,
	});
	boardFrame.addChild(boardRenderer);
	const previewWidth = 100;
	const previewHeight = 136;
	const previewTitle = createText("下一个", 14);
	const nextPiecePreview = new NextPiecePreview(previewWidth - 16, previewHeight - 44);
	const previewPanel = new Container().options({
		width: previewWidth,
		height: previewHeight,
		padding: [8, 8],
		background: 0x273640,
	}).add(previewTitle);
	nextPiecePreview.position.set(8, 34);
	previewPanel.addChild(nextPiecePreview);
	const playArea = new HContainer().options({
		width: 300,
		height: config.rows * 16,
		spacing: 12,
		align: "center",
		background: "transparent",
	}).add(boardFrame, previewPanel);

	const moveRow = new HContainer().options({
		width: 300,
		height: CONTROL_HEIGHT,
		spacing: 8,
		align: "center",
		background: "transparent",
	});
	const actionRow = new HContainer().options({
		width: 300,
		height: CONTROL_HEIGHT,
		spacing: 10,
		align: "center",
		background: "transparent",
	});

	let tickerAttached = false;
	let elapsed = 0;
	let arrowDownHeld = false;
	let arrowDownPiece: Piece | null = null;

	const leftButton = createButton("←", 56, () => moveAndRender(-1, 0)).button;
	const rotateButton = createButton("↻", 56, () => {
		if (state.status === "playing" && rotatePiece(state)) render();
	}).button;
	const rightButton = createButton("→", 56, () => moveAndRender(1, 0)).button;
	const softDropButton = createButton("↓", 56, () => {
		if (state.status === "playing") handleStep(softDrop(state));
	}).button;
	const hardDropButton = createButton("落底", 96, () => {
		if (state.status === "playing") handleStep(hardDrop(state));
	}).button;
	const { button: startButton, label: startText } = createButton("开始", 112, toggleGame, 0x315c48);

	// moveRow.add(leftButton, rotateButton, rightButton, softDropButton);
	actionRow.add(startButton);

	const stack = new VContainer().options({
		width: 1,
		height: 1,
		padding: SCREEN_PADDING,
		spacing: SECTION_GAP,
		align: "center",
		background: "transparent",
	}).add(stats, playArea, moveRow, actionRow);
	const screen = new Container().options({
		width: 1,
		height: 1,
		padding: 0,
		background: "transparent",
	}).add(stack);

	root.add(screen);

	function moveAndRender(dx: number, dy: number) {
		if (state.status === "playing" && movePiece(state, dx, dy)) render();
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			if (!arrowDownHeld) {
				arrowDownHeld = true;
				arrowDownPiece = state.status === "playing" ? state.current : null;
			}
			if (state.status === "playing" && arrowDownPiece && state.current === arrowDownPiece) {
				handleStep(softDrop(state));
			}
			return;
		}

		if (state.status !== "playing") return;

		switch (event.key) {
			case "ArrowLeft":
				event.preventDefault();
				moveAndRender(-1, 0);
				break;
			case "ArrowRight":
				event.preventDefault();
				moveAndRender(1, 0);
				break;
			case "ArrowUp":
				event.preventDefault();
				if (rotatePiece(state)) render();
				break;
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key !== "ArrowDown") return;
		arrowDownHeld = false;
		arrowDownPiece = null;
	}

	function handleWindowBlur() {
		arrowDownHeld = false;
		arrowDownPiece = null;
	}

	function handleStep(result: StepResult) {
		if (result.clearedLines > 0) {
      // 消除不必提示
			// Toast.success(`消除 ${result.clearedLines} 行`);
		}
		if (result.gameOver) {
			stopTicker();
			Toast.error("游戏结束");
		}
		render();
	}

	function render() {
		boardRenderer.draw(state);
		nextPiecePreview.draw(state.next);
		if (state.score > highScore) {
			highScore = state.score;
			saveConfig(HIGH_SCORE_KEY, highScore);
		}
		scoreText.options({ text: `分数 ${state.score}` });
		linesText.options({ text: `消行 ${state.lines}` });
		highScoreText.options({ text: `最高 ${highScore}` });
		stats.refresh();
		const actionLabel = {
			ready: "开始",
			playing: "暂停",
			paused: "继续",
			over: "重新开始",
		}[state.status];
		startText.options({ text: actionLabel });
	}

	function toggleGame() {
		if (pauseGame(state)) {
			stopTicker();
			render();
			return;
		}
		if (resumeGame(state)) {
			startTicker();
			render();
			return;
		}
		startOrRestart();
	}

	function startOrRestart() {
		startGame(state);
		elapsed = 0;
		render();
		startTicker();
	}

	function onTick(_time: number, deltaMs: number) {
		if (state.status !== "playing") return;
		elapsed += deltaMs;
		let clearedLines = 0;
		let changed = false;
		while (elapsed >= config.interval && state.status === "playing") {
			elapsed -= config.interval;
			const result = softDrop(state);
			clearedLines += result.clearedLines;
			changed = true;
			if (result.gameOver) {
				stopTicker();
				Toast.error("游戏结束");
			}
		}
		if (clearedLines > 0) Toast.success(`消除 ${clearedLines} 行`);
		if (changed) render();
	}

	function startTicker() {
		if (tickerAttached) return;
		tickerAttached = true;
		gsap.ticker.add(onTick);
	}

	function stopTicker() {
		if (!tickerAttached) return;
		tickerAttached = false;
		gsap.ticker.remove(onTick);
	}

	function resize() {
		const width = Math.max(1, canvas.clientWidth);
		const height = Math.max(1, canvas.clientHeight);
		const contentWidth = Math.max(1, width - SCREEN_PADDING * 2);
		const fixedHeight = SCREEN_PADDING * 2 + STATS_HEIGHT + CONTROL_HEIGHT * 2 + previewHeight + SECTION_GAP * 3;
		const availableBoardHeight = Math.max(config.rows * 8, height - fixedHeight);
		const previewGap = 12;
		const boardAvailableWidth = Math.max(config.cols * 8, contentWidth - previewWidth - previewGap);
		const cellSize = Math.max(8, Math.floor(Math.min(boardAvailableWidth / config.cols, availableBoardHeight / config.rows)));
		const boardWidth = cellSize * config.cols;
		const boardHeight = cellSize * config.rows;
		const playAreaWidth = boardWidth + previewGap + previewWidth;
		const moveButtonWidth = buttonWidth(contentWidth);
		const moveControlsWidth = moveButtonWidth * 4 + 8 * 3;
		const actionControlsWidth = 96 + 112 + 10;

		screen.options({ width, height });
		stack.options({ width, height });
		stats.options({ width: contentWidth });
		boardFrame.options({ width: boardWidth, height: boardHeight });
		playArea.options({
			width: contentWidth,
			height: Math.max(boardHeight, previewHeight),
			padding: [0, 0, 0, Math.max(0, (contentWidth - playAreaWidth) / 2)],
		});
		previewPanel.options({ width: previewWidth, height: previewHeight });
		nextPiecePreview.resize(previewWidth - 16, previewHeight - 44);
		moveRow.options({
			width: contentWidth,
			padding: [0, 0, 0, Math.max(0, (contentWidth - moveControlsWidth) / 2)],
		});
		actionRow.options({
			width: contentWidth,
			padding: [0, 0, 0, Math.max(0, (contentWidth - actionControlsWidth) / 2)],
		});
		leftButton.options({ width: moveButtonWidth });
		rotateButton.options({ width: moveButtonWidth });
		rightButton.options({ width: moveButtonWidth });
		softDropButton.options({ width: moveButtonWidth });
		boardRenderer.resize(cellSize);
		boardRenderer.draw(state);
		nextPiecePreview.draw(state.next);
	}

	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(canvas);
	window.addEventListener("keydown", handleKeyDown);
	window.addEventListener("keyup", handleKeyUp);
	window.addEventListener("blur", handleWindowBlur);
	resize();
	render();

	return () => {
		stopTicker();
		window.removeEventListener("keydown", handleKeyDown);
		window.removeEventListener("keyup", handleKeyUp);
		window.removeEventListener("blur", handleWindowBlur);
		resizeObserver.disconnect();
		screen.destroy({ children: true });
		root.destroy();
	};
}

function createText(text: string, fontSize: number) {
	return new Text().options({
		text,
		fontSize,
		textColor: 0xf0f4f8,
		textWeight: "bold",
	});
}

function createButton(text: string, width: number, onClick: () => void, background = 0x334653) {
	const label = createText(text, 20);
	const verticalPadding = Math.max(0, (CONTROL_HEIGHT - label.height) / 2);
	const content = new VContainer().options({
		width,
		height: CONTROL_HEIGHT,
		padding: [verticalPadding, 0],
		align: "center",
		background: "transparent",
	}).add(label);
	const button = new Button().options({
		width,
		height: CONTROL_HEIGHT,
		padding: [0],
		background,
		onClick,
	}).add(content);
	return { button, label };
}

function boundedInteger(value: number, fallback: number, min: number, max: number) {
	return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;
}

function buttonWidth(contentWidth: number) {
	return Math.max(42, Math.min(56, Math.floor((contentWidth - 24) / 4)));
}
