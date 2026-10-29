<template>
  <div class="threejs-page">
    <aside class="demo-sidebar" :class="{ 'demo-sidebar--collapsed': isMenuCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-title">
          <span v-if="!isMenuCollapsed">Three.js Demos</span>
          <span v-else>Demos</span>
        </div>
        <UiButton
          variant="ghost"
          size="small"
          :aria-label="isMenuCollapsed ? '展开菜单' : '收起菜单'"
          @click="isMenuCollapsed = !isMenuCollapsed"
        >
          <span aria-hidden="true">{{ isMenuCollapsed ? "☰" : "×" }}</span>
        </UiButton>
      </div>

      <div v-if="!isMenuCollapsed" class="sidebar-search">
        <input type="search" placeholder="搜索..." aria-label="搜索 Three.js 示例" />
      </div>

      <nav class="demo-list" aria-label="Three.js 示例">
        <UiCard
          v-for="item of demoList"
          :key="item.id"
          :to="item.path"
          class="demo-link"
          :class="{ 'demo-link--active': isActive(item.path) }"
        >
          <span>{{ item.name }}</span>
          <span v-if="!isMenuCollapsed" class="demo-link-arrow" aria-hidden="true">↗</span>
        </UiCard>
      </nav>
    </aside>

    <main class="demo-content" :style="contentStyle">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, shallowRef } from "vue";
import { useRoute } from "vue-router";
import { getMenuList } from "../api/three/index";
import { UiButton, UiCard } from "../components/ui";

type DemoItem = Awaited<ReturnType<typeof getMenuList>>[number];

const route = useRoute();
const isMenuCollapsed = ref(false);
const demoList = shallowRef<DemoItem[]>([]);
const contentStyle = computed(() => {
  const sidebarWidth = isMenuCollapsed.value ? "80px" : "256px";
  return {
    marginLeft: sidebarWidth,
    width: `calc(100% - ${sidebarWidth})`,
  };
});

onMounted(async () => {
  demoList.value = await getMenuList();
});

function isActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`);
}
</script>

<style scoped>
.threejs-page {
  min-height: 100vh;
  color: var(--ui-color-text);
  background: var(--ui-color-background);
}

.demo-sidebar {
  position: fixed;
  z-index: 3;
  inset: 0 auto 0 0;
  display: flex;
  width: 256px;
  flex-direction: column;
  border-right: 1px solid var(--ui-color-border);
  background: var(--ui-color-surface);
  transition: width 180ms ease;
}

.demo-sidebar--collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 10px 18px;
  border-bottom: 1px solid var(--ui-color-border);
}

.sidebar-title {
  min-width: 0;
  overflow: hidden;
  color: var(--ui-color-text);
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sidebar-header :deep(.ui-button) {
  min-width: 34px;
  padding: 0 8px;
  font-size: 18px;
}

.sidebar-search {
  padding: 14px 14px 10px;
}

.sidebar-search input {
  width: 100%;
  padding: 10px 11px;
  border: 0;
  border-bottom: 1px solid var(--ui-color-border-strong);
  outline: none;
  color: var(--ui-color-text);
  background: transparent;
  font: inherit;
  font-size: 12px;
}

.sidebar-search input:focus {
  border-color: var(--ui-color-accent);
}

.sidebar-search input::placeholder {
  color: var(--ui-color-text-subtle);
}

.demo-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding: 10px;
}

.demo-link {
  display: flex;
  min-height: 42px;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-color: transparent;
  color: var(--ui-color-text-muted);
  background: transparent;
  font-size: 12px;
  transition: background 160ms ease, color 160ms ease;
}

.demo-link:hover,
.demo-link--active {
  border-color: var(--ui-color-border);
  color: var(--ui-color-text);
  background: rgba(255, 255, 255, 0.06);
}

.demo-link.ui-card--interactive:hover {
  transform: none;
}

.demo-link--active {
  border-color: var(--ui-color-accent-border);
  color: var(--ui-color-accent);
  background: rgba(182, 239, 103, 0.08);
}

.demo-link-arrow {
  color: var(--ui-color-text-subtle);
}

.demo-content {
  min-height: 100vh;
  transition: margin-left 180ms ease, width 180ms ease;
}

@media (max-width: 600px) {
  .demo-sidebar {
    width: 208px;
  }

  .demo-sidebar--collapsed {
    width: 64px;
  }

  .demo-content {
    margin-left: 208px !important;
    width: calc(100% - 208px) !important;
  }

  .demo-sidebar--collapsed ~ .demo-content {
    margin-left: 64px !important;
    width: calc(100% - 64px) !important;
  }
}
</style>
