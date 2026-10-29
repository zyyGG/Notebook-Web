<template>
  <RouterLink
    v-if="to && !disabled"
    :to="to"
    class="ui-button"
    :class="buttonClasses"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href && !disabled"
    :href="href"
    class="ui-button"
    :class="buttonClasses"
  >
    <slot />
  </a>
  <button
    v-else
    class="ui-button"
    :class="buttonClasses"
    :type="type"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "small" | "medium" | "large";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    size?: ButtonSize;
    to?: RouteLocationRaw;
    href?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    variant: "primary",
    size: "medium",
    type: "button",
    disabled: false,
    block: false,
  },
);

const buttonClasses = computed(() => [
  `ui-button--${props.variant}`,
  `ui-button--${props.size}`,
  { "ui-button--block": props.block },
]);
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  gap: 13px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: var(--ui-radius-control);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform 160ms ease, background 160ms ease;
}

.ui-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.ui-button--primary {
  color: var(--ui-color-background);
  background: var(--ui-color-accent);
}

.ui-button--primary:hover:not(:disabled) {
  background: var(--ui-color-accent-hover);
}

.ui-button--secondary {
  border-color: var(--ui-color-border-strong);
  color: var(--ui-color-text);
  background: rgba(255, 255, 255, 0.03);
}

.ui-button--secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.ui-button--ghost {
  color: var(--ui-color-text-muted);
  background: transparent;
}

.ui-button--ghost:hover:not(:disabled) {
  color: var(--ui-color-accent);
  background: rgba(255, 255, 255, 0.05);
}

.ui-button--small {
  min-height: 34px;
  padding: 0 12px;
  font-size: 11px;
}

.ui-button--large {
  min-height: 50px;
  padding: 0 22px;
  font-size: 13px;
}

.ui-button--block {
  display: flex;
  width: 100%;
}

.ui-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
