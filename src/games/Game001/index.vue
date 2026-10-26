<template>
  <div ref="canvas" class="h-full"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import initGame from ".";
const canvas = ref<HTMLDivElement | null>(null);
let gameController: AbortController | undefined;
onMounted(() => {
  if (!canvas.value) return;
  gameController = new AbortController();
  void initGame(canvas.value, gameController.signal);
});

onUnmounted(() => {
  gameController?.abort();
  gameController = undefined;
});

function handleRefresh() {
  localStorage.removeItem("gameConfig_saolei");
  location.reload();
}

defineExpose({
  handleRefresh
});
</script>
