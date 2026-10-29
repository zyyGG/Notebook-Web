<template>
  <div class="ui-section-heading">
    <div>
      <UiBadge v-if="eyebrow" tone="accent">{{ eyebrow }}</UiBadge>
      <h2>{{ title }}</h2>
    </div>
    <div v-if="$slots.action" class="ui-section-heading__action">
      <slot name="action" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiBadge from "./UiBadge.vue";

defineProps<{
  eyebrow?: string;
  title: string;
}>();
</script>

<style scoped>
.ui-section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 22px;
}

.ui-section-heading h2 {
  margin: 9px 0 0;
  color: var(--ui-color-text);
  font-size: 22px;
  letter-spacing: -0.04em;
}

.ui-section-heading__action {
  flex: 0 0 auto;
}

@media (max-width: 420px) {
  .ui-section-heading h2 {
    font-size: 18px;
  }
}
</style>
