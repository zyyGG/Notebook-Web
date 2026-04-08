<template>
  <div class="flex flex-col">
    <!-- 选择卡 -->
     <div class="grid grid-cols-6 w-full h-full gap-4 p-8">
       <GameCard title="扫雷" path="/gameContainer/game001" />
     </div>
  </div>
</template>
<script lang="ts" setup>
import GameCard from "../components/GameCard.vue";

</script>
<style lang="scss" scoped></style>
