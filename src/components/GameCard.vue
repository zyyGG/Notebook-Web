<template>
  <div
    class="flex flex-col w-full h-48 rounded-2xl overflow-hidden cursor-pointer transition hover:scale-102 shadow-2xl hover:shadow-lg"
    @click="handleClick"
  >
    <!-- 图像区域-->
    <div class="flex-1 w-full h-full bg-gray-300 bg-opacity-30 overflow-hidden">
      <img
        :src="imageSrc"
        alt=""
        class="w-full h-full object-cover "
        @error="handleImgError"
      />
    </div>
    <!-- 标题 -->
    <div class="w-full  text-large text-center font-bold">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../states/gameStore";

const router = useRouter();
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
  }
);

function handleImgError() {
  if (hasFallback.value) return;
  imageSrc.value = fallbackSrc;
  hasFallback.value = true;
}

function handleClick() {
  gameStore.title = props.title;
  router.push(props.path);
}
</script>

<style lang="scss" scoped></style>
