<template>
  <div class="w-full flex flex-row h-screen overflow-hidden">
    <div class="position-absolute flex flex-col w-64 h-full bg-gray-900 transition-width" :style="{'width': isMenuCollapsed == true ? 'calc(var(--spacing) * 36)': 'calc(var(--spacing) * 64)'}">
      <!-- 控制器 -->
      <div class="w-full pl-2">
        <div class="w-full flex flex-col">
          <div class="w-full flex flex-row items-center justify-end">
            <div class="flex-1">
              <span class="text-white font-bold text-xl whitespace-nowrap" v-show="isMenuCollapsed == false">Three.js Demos</span>
              <span class="text-white font-bold text-xl whitespace-nowrap" v-show="isMenuCollapsed == true">Demos</span>
            </div>
            
            <!-- 收起菜单按钮 -->
            <button class="px-4 py-2 hover:bg-gray-200 hover:text-gray-700" @click="() => {isMenuCollapsed = !isMenuCollapsed}">
              <!-- 收起菜单 -->
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>

          </div>
          <div class="flex flex-row items-center" v-show="isMenuCollapsed == false">
            <input type="text" class="block flex-1 w-full h-full border-b border-gray-300 p-2 outline-none text-white bg-gray-900" placeholder="搜索..." />
            <!-- 搜索按钮 -->
            <button class="px-4 py-2 hover:bg-gray-200 hover:text-gray-700 relative top-2">
              <!-- 搜索图标 -->
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24.000000" height="24.000000" fill="none">
                <rect id="容器 9" width="24.000000" height="24.000000" x="0.000000" y="0.000000" />
                <circle id="椭圆 3" cx="9.5" cy="9.5" r="6" stroke="rgb(205,205,205)" stroke-width="1.000000" />
                <path id="直线 2" d="M0 -0.5L9.8995 -0.5Q9.94874 -0.5 9.99704 -0.490393Q10.0453 -0.480785 10.0908 -0.46194Q10.1363 -0.443094 10.1773 -0.415735Q10.2182 -0.388375 10.253 -0.353553Q10.2879 -0.318731 10.3152 -0.277785Q10.3426 -0.236839 10.3614 -0.191342Q10.3803 -0.145845 10.3899 -0.0975452Q10.3995 -0.0492457 10.3995 0Q10.3995 0.0492457 10.3899 0.0975452Q10.3803 0.145845 10.3614 0.191342Q10.3426 0.236839 10.3152 0.277785Q10.2879 0.318731 10.253 0.353553Q10.2182 0.388375 10.1773 0.415735Q10.1363 0.443094 10.0908 0.46194Q10.0453 0.480785 9.99704 0.490393Q9.94874 0.5 9.8995 0.5L0 0.5L0 -0.5ZM9.87949 -0.48L9.8995 -0.5C10.1795 -0.5 10.3995 -0.28 10.3995 0C10.3995 0.28 10.1795 0.5 9.8995 0.5L9.87949 0.48L9.87949 -0.48Z" fill="rgb(205,205,205)" fill-rule="nonzero" transform="matrix(0.707107,0.707107,-0.707107,0.707107,14,14)" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <div v-for="item of demoList" :key="item.id" v-show="isMenuCollapsed == false">
          <router-link :to="item.path" class="block p-2 hover:bg-gray-700 rounded">
            <!-- <div class="w-full aspect-ratio-4/3 rounded rounded-lg"></div> -->
            <div class="w-full text-left text-white">{{ item.name }}</div>
          </router-link>
        </div>
        <div v-for="item of demoList" :key="item.id" v-show="isMenuCollapsed == true">
          <router-link :to="item.path" class="block py-2 px-1 hover:bg-gray-700 rounded">
            <div class="w-full text-left text-white">{{ item.name }}</div>
          </router-link>
        </div>
      </div>
    </div>
    <div class="flex-1 pl-64 transition-padding" :style="{'padding-left': isMenuCollapsed == true ? 'calc(var(--spacing) * 36)' : 'calc(var(--spacing) * 64)'}">
      <router-view></router-view>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {ref, onMounted, shallowRef } from "vue"
type DemoItem = {
  id: number | string,
  name: string,
  path: string,
  tags: string[],
}
const isMenuCollapsed = ref(false)
const demoList = shallowRef<DemoItem[]>([])
onMounted(async () => {
  if(import.meta.env.DEV) {
    const fileList = await import("../threejs/menuList.json")
    demoList.value = fileList.default
  } else {
    const response = await fetch("/threejs-demos.json")
    const data = await response.json()
    demoList.value = data
  }
})

</script>
<style lang="scss" scoped>
</style>