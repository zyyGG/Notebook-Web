<template>
  <RouterLink
    v-if="to"
    :to="to"
    class="ui-card ui-card--interactive"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href="href"
    class="ui-card ui-card--interactive"
  >
    <slot />
  </a>
  <article v-else class="ui-card">
    <slot />
  </article>
</template>

<script lang="ts" setup>
import { RouterLink, type RouteLocationRaw } from "vue-router";

defineProps<{
  to?: RouteLocationRaw;
  href?: string;
}>();
</script>

<style scoped>
.ui-card {
  display: block;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-card);
  color: var(--ui-color-text);
  background: var(--ui-color-surface);
  text-decoration: none;
}

.ui-card--interactive {
  transition: transform 160ms ease, border-color 160ms ease;
}

.ui-card--interactive:hover {
  transform: translateY(-3px);
  border-color: var(--ui-color-accent-border);
}
</style>
