<template>
  <div class="flex flex-col h-screen">
    <div ref="tapbar" class="position-absolute top-0 left-0 bg-[#3e3e3e] flex flex-row w-full p-block-4 box-border shadow-xl shadow-dark-400" :class="{hidden: isTapbarHidden}">
      <!-- 顶部 -->
      <div class="flex flex-row items-center justify-start w-full h-full">
        <!-- 其他控件 -->
        <div class="flex flex-row items-center justify-center p-inline-4 gap-4">
          
        </div>
        <!-- <div class="flex-1 w-full text-center border">{{ gameStore.title }}</div> -->
        <!-- 配置按钮 -->
        <div class="flex flex-row items-center justify-end w-full h-full">
          <!-- 设置 -->
          <div class="transition w-12 cursor-pointer opacity-80 hover:opacity-100">
            <IconConfig theme="outline" size="24" fill="#fff" />
          </div>
          <!-- 重置 -->
          <div class="transition w-12 cursor-pointer opacity-80 hover:opacity-100" @click="handleRefresh">
            <IconRefresh theme="outline" size="24" fill="#fff"/>
          </div>
          <div class="transition w-12 cursor-pointer opacity-80 hover:opacity-100" @click="handleTapBarHidden(true)">
            <IconFoldUpOne theme="outline" size="24" fill="#fff"/>
          </div>
        </div>
      </div>
    </div>
    <!-- 按钮-->
    <div class="flex items-center justify-center position-absolute w-6 h-6 shadow-md top-0 right-12 cursor-pointer opacity-80 hover:opacity-100" @click="handleTapBarHidden(false)" :class="{hidden: !isTapbarHidden}">
      <IconExpandDownOne theme="outline" size="12" fill="#fff"/>
    </div>

    <div class="flex-1 h-full p-t-6">
      <router-view v-slot="{ Component }">
        <component :is="Component" ref="routeView" />
      </router-view>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Config as IconConfig, FoldUpOne as IconFoldUpOne, ExpandDownOne as IconExpandDownOne, Refresh as IconRefresh } from "@icon-park/vue-next";
import { ref } from "vue";
import type { ComponentPublicInstance } from "vue";
// import { useGameStore } from "../states/gameStore";

// const gameStore = useGameStore();
const isTapbarHidden = ref(true);
const tapbar = ref<HTMLDivElement>();
type RouteViewExpose = {
  handleRefresh?: () => void,
}
const routeView = ref<(ComponentPublicInstance & RouteViewExpose) | null>(null);

function handleTapBarHidden(hidden: boolean) {
  if(hidden === true) {
    tapbar.value?.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-200%)" },
      ],
      {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      }
    ).finished.then(() => {
      isTapbarHidden.value = hidden;
    });
  }

  if(hidden === false) {
    isTapbarHidden.value = hidden;
    tapbar.value?.animate(
      [
        { transform: "translateY(-200%)" },
        { transform: "translateY(0)" },
      ],
      {
        duration: 300,
        easing: "ease-out",
        fill: "forwards",
      }
    )
  }
}

function handleRefresh() {
  routeView.value?.handleRefresh?.();
}

</script>
<style scoped>
.hidden {
  display: none;
}

@keyframes tapbarSlideIn {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>