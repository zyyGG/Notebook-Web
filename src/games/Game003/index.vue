<template>
  <div ref="canvas" class="h-full"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import initGame from ".";
const canvas = ref<HTMLDivElement | null>(null);
let disposeGame: (() => void) | undefined;
let isUnmounted = false;

onMounted(async () => {
  if (!canvas.value) return;
  const dispose = await initGame(canvas.value);
  if (isUnmounted) dispose();
  else disposeGame = dispose;
});

onUnmounted(() => {
  isUnmounted = true;
  disposeGame?.();
  disposeGame = undefined;
});

function handleRefresh() {
  localStorage.removeItem("gameConfig_eluosifangkuai");
  location.reload();
}

defineExpose({
  handleRefresh
})
</script>
