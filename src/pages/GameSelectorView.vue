<template>
  <main class="game-selector">
    <UiSectionHeading eyebrow="PLAY / ARCADE" title="挑一款游戏，马上开始">
      <template #action>
        <UiBadge tone="muted">{{ gameCount }} 款游戏</UiBadge>
      </template>
    </UiSectionHeading>

    <div class="game-grid">
      <GameCard title="扫雷" path="/gameContainer/game001" />
      <GameCard title="连连看" path="/gameContainer/game002" />
      <GameCard title="俄罗斯方块" path="/gameContainer/game003" />
      <GameCard title="蜘蛛纸牌" path="/gameContainer/game004" />
      <GameCard v-if="showDemoGame" title="游戏Demo" path="/gameContainer/gameDemo" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import GameCard from "../components/GameCard.vue";
import { UiBadge, UiSectionHeading } from "../components/ui";

const showDemoGame = ref(true);
const gameCount = computed(() => (showDemoGame.value ? 5 : 4));

onMounted(() => {
  showDemoGame.value = import.meta.env.VITE_ENV === "development";
});
</script>

<style scoped>
.game-selector {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 32px 0 56px;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 18px;
}

@media (max-width: 520px) {
  .game-selector {
    padding-top: 20px;
  }

  .game-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}
</style>
