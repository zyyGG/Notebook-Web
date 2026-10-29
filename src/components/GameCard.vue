<template>
  <UiCard :to="path" class="game-card" @click="handleClick">
    <div class="game-card__image">
      <img :src="imageSrc" :alt="title" @error="handleImgError" />
    </div>
    <div class="game-card__title">{{ title }}</div>
  </UiCard>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { UiCard } from "./ui";
import { useGameStore } from "../states/gameStore";

const gameStore = useGameStore();

const props = defineProps({
  title: {
    type: String,
    default: "游戏标题",
  },
  path: {
    type: String,
    default: "/",
  },
});

const fallbackSrc = "/assets/default_image.png";
const imageSrc = ref(`/assets/${props.title}.jpg`);
const hasFallback = ref(false);

watch(
  () => props.title,
  (newTitle) => {
    imageSrc.value = `/assets/${newTitle}.jpg`;
    hasFallback.value = false;
  },
);

function handleImgError() {
  if (hasFallback.value) return;
  imageSrc.value = fallbackSrc;
  hasFallback.value = true;
}

function handleClick() {
  gameStore.title = props.title;
}
</script>

<style scoped>
.game-card {
  display: flex;
  min-height: 192px;
  flex-direction: column;
  overflow: hidden;
}

.game-card__image {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--ui-color-surface-raised);
}

.game-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 142px;
  object-fit: cover;
  transition: transform 180ms ease;
}

.game-card:hover .game-card__image img {
  transform: scale(1.04);
}

.game-card__title {
  padding: 14px 12px;
  color: var(--ui-color-text);
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}
</style>
