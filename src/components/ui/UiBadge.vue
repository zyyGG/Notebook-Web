<template>
  <span class="ui-badge" :class="[`ui-badge--${tone}`, { 'ui-badge--dot': dot }]">
    <span v-if="dot" class="ui-badge__dot" aria-hidden="true"></span>
    <slot />
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    tone?: "accent" | "muted" | "blue" | "warm";
    dot?: boolean;
  }>(),
  {
    tone: "accent",
    dot: false,
  },
);
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: var(--ui-color-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.ui-badge--muted {
  color: var(--ui-color-text-subtle);
}

.ui-badge--blue {
  color: var(--ui-color-blue);
}

.ui-badge--warm {
  color: var(--ui-color-warm);
}

.ui-badge__dot {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 12px currentColor;
}
</style>
