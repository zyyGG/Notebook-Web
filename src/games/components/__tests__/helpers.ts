/**
 * 创建一个假的 FederatedEvent，用于直接 emit 给组件的事件处理器。
 * PixiJS 组件使用 EventEmitter 风格的 .on("pointerdown", handler)，
 * 可以直接通过 .emit("pointerdown", fakeEvent) 触发，无需真实的指针调度。
 *
 * 返回类型使用 any 绕过 FederatedEvent 与 FederatedPointerEvent 之间的
 * 严格类型检查 —— emit 在运行时接受任意参数。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeFakeEvent(
  currentTarget?: unknown,
  extra?: Record<string, unknown>,
): any {
  return { currentTarget, ...extra };
}
