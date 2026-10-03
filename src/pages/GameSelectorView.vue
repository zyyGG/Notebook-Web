<template>
  <div class="flex flex-col">
    <!-- 选择卡 -->
    <div class="grid grid-cols-6 w-full h-full gap-4 p-8">
      <GameCard title="扫雷" path="/gameContainer/game001" />
      <GameCard title="连连看" path="/gameContainer/game002" />
      <GameCard title="俄罗斯方块" path="/gameContainer/game003" />
      <template v-if="showDemoGame">
        <GameCard title="游戏Demo" path="/gameContainer/gameDemo" />
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
import GameCard from "../components/GameCard.vue";
import { ref, onMounted } from "vue";

const showDemoGame = ref(true);

onMounted(() => {
  if(import.meta.env.VITE_ENV === 'development') {
    showDemoGame.value = true;
  } else {
    showDemoGame.value = false;
  }
});

</script>
<style lang="scss" scoped></style>
