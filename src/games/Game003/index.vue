<template>
  <div ref="canvas" class="h-full"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import initGame from ".";
const canvas = ref<HTMLDivElement | null>(null);
onMounted(() => {
  canvas.value && initGame(canvas.value);
});

function handleRefresh() {
  localStorage.removeItem("gameConfig_eluosifangkuai");
  location.reload();
}

defineExpose({
  handleRefresh
})
</script>
