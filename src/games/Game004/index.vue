<template>
  <div class="flex h-full flex-col">
    <div ref="canvas" class="flex-1 min-h-0"></div>
    <p class="asset-attribution">
      素材来源：扑克牌图片来自
      <a href="https://github.com/htdebeer/SVG-cards" target="_blank" rel="noopener noreferrer">SVG-cards</a>，
      原作者为 David Bellot，由 htdebeer 维护和改进。采用
      <a href="https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html" target="_blank" rel="noopener noreferrer">GNU LGPL 2.1</a>
      许可证。
    </p>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import initGame from "./index";
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
  localStorage.removeItem("gameConfig_spiderSolitaire");
  location.reload();
}

defineExpose({
  handleRefresh
})
</script>
<style scoped>
.asset-attribution {
  flex: 0 0 auto;
  margin: 0;
  padding: 6px 12px;
  color: #777;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

.asset-attribution a {
  color: inherit;
  text-decoration: underline;
}
</style>
