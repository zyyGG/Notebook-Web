<template>
  <div class="h-full relative" ref="container"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import createScene from "./index"

const container = ref<HTMLElement | null>(null);
const { init, render, destory } = createScene();

onMounted(async () => {
  if (container.value) {
    await init(container.value);
    render();
  }
});

onBeforeUnmount(() => {
  destory();
  if(container.value) {
    container.value.innerHTML = "";
  }
})
</script>
<style scoped>

</style>
