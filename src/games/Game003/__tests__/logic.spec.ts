import { describe, expect, it } from "vitest";
import { createGameState, hardDrop, movePiece, pauseGame, resumeGame, rotatePiece, softDrop, startGame } from "../logic";

describe("Game003 tetris logic", () => {
  it("prepares a preview piece before starting", () => {
    const state = createGameState(20, 10);

    expect(state.current).toBeNull();
    expect(state.next).toBeTypeOf("string");
  });

  it("pauses and resumes without resetting the active piece or score", () => {
    const state = createGameState(20, 10);
    startGame(state, "T", "I");
    movePiece(state, -1, 1);
    const pausedPiece = state.current;
    const pausedScore = state.score;

    expect(pauseGame(state)).toBe(true);
    expect(movePiece(state, 1, 0)).toBe(false);
    expect(softDrop(state).locked).toBe(false);
    expect(resumeGame(state)).toBe(true);

    expect(state.status).toBe("playing");
    expect(state.current).toBe(pausedPiece);
    expect(state.score).toBe(pausedScore);
  });

  it("moves pieces within board bounds and rotates them", () => {
    const state = createGameState(20, 10);
    startGame(state, "T");
    const initialShape = state.current!.shape;

    expect(movePiece(state, -100, 0)).toBe(false);
    expect(movePiece(state, -1, 0)).toBe(true);
    expect(rotatePiece(state)).toBe(true);
    expect(state.current!.shape).not.toEqual(initialShape);
  });

  it("uses a horizontal wall kick when a rotation otherwise collides", () => {
    const state = createGameState(6, 6);
    startGame(state, "I");
    state.current!.shape = [[true], [true], [true], [true]];
    state.current!.x = 0;
    state.current!.y = 1;
    state.board[1][0] = "J";

    expect(rotatePiece(state)).toBe(true);
    expect(state.current!.x).toBe(1);
    expect(state.current!.shape).toHaveLength(1);
  });

  it("soft drops one row and hard drops to lock a piece", () => {
    const state = createGameState(8, 6);
    startGame(state, "O");
    const startY = state.current!.y;

    expect(softDrop(state).locked).toBe(false);
    expect(state.current!.y).toBe(startY + 1);

    const result = hardDrop(state);
    expect(result.locked).toBe(true);
    expect(state.board[7].filter(Boolean)).toHaveLength(2);
    expect(state.status).toBe("playing");
  });

  it("promotes the previewed piece after the current piece locks", () => {
    const state = createGameState(8, 6);
    startGame(state, "O", "T");

    expect(state.current?.type).toBe("O");
    expect(state.next).toBe("T");

    hardDrop(state);

    expect(state.current?.type).toBe("T");
    expect(state.next).not.toBeNull();
  });

  it("clears multiple rows and awards the corresponding score", () => {
    const state = createGameState(4, 4);
    startGame(state, "O");
    state.board[2] = ["I", "I", null, null];
    state.board[3] = ["J", "J", null, null];
    state.current = { type: "O", shape: [[true, true], [true, true]], x: 2, y: 0 };

    const result = hardDrop(state);

    expect(result.clearedLines).toBe(2);
    expect(state.lines).toBe(2);
    expect(state.score).toBe(300);
    expect(state.board).toEqual(Array.from({ length: 4 }, () => [null, null, null, null]));
  });

  it("ends when the next piece cannot spawn", () => {
    const state = createGameState(4, 4);
    startGame(state, "O");
    state.board[0] = [null, "T", "T", "T"];
    state.board[1] = ["J", "J", "J", null];
    state.current = { type: "O", shape: [[true, true], [true, true]], x: 1, y: 2 };

    const result = hardDrop(state);

    expect(result.gameOver).toBe(true);
    expect(state.status).toBe("over");
    expect(state.current).toBeNull();
  });
});