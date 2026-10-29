<template>
  <main class="diary-page">
    <UiSectionHeading eyebrow="NOTES / JOURNAL" title="创作日志" />

    <UiCard class="diary-empty">
      <UiBadge tone="warm">正在准备中</UiBadge>
      <h1>每一次尝试，都值得被记下来。</h1>
      <p>这里会收集项目进度、灵感片段，以及开发过程中学到的新东西。</p>
      <UiButton to="/gameSelector" variant="secondary">
        先去玩一款游戏 <span aria-hidden="true">→</span>
      </UiButton>
    </UiCard>
  </main>
</template>

<script lang="ts" setup>
import { UiBadge, UiButton, UiCard, UiSectionHeading } from "../components/ui";
</script>

<style scoped>
.diary-page {
  width: min(900px, 100%);
  margin: 0 auto;
  padding: 32px 0 56px;
}

.diary-empty {
  display: flex;
  min-height: 300px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(24px, 6vw, 56px);
}

.diary-empty h1 {
  max-width: 560px;
  margin: 22px 0 10px;
  color: var(--ui-color-text);
  font-size: clamp(26px, 4vw, 38px);
  letter-spacing: -0.05em;
  line-height: 1.25;
}

.diary-empty p {
  max-width: 520px;
  margin: 0 0 26px;
  color: var(--ui-color-text-muted);
  font-size: 14px;
  line-height: 1.8;
}
</style>
