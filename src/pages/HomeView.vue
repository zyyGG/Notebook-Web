<template>
  <div class="flex flex-col h-screen">
    <div class="flex flex-row w-full h-12 shadow-2xl shadow-dark-400">
      <!-- 其他按钮 -->
      <div class="flex flex-row">
        <TabBarButton :activeClassName="route.path === '/' ? 'text-blue' : ''">首页</TabBarButton>
        <TabBarButton :activeClassName="route.path === '/diary' ? 'text-blue' : ''">记录</TabBarButton>
        <TabBarButton :activeClassName="route.path === '/gameSelector' ? 'text-blue' : ''">
          <router-link to="/gameSelector">小游戏</router-link>
        </TabBarButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import TabBarButton from "../components/TabBarButton.vue"
import { useRoute } from "vue-router";

const route = useRoute();

</script>
<style lang="scss" scoped>
  
</style>