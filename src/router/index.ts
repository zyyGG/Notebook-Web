import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../pages/HomeView.vue"),
  },
  {
    path: "/gameSelector",
    component: () => import("../pages/GameSelectorView.vue"),
  },
  {
    path: "/gameContainer",
    component: () => import("../pages/GameContainerView.vue"),
  },
  {
    path: "/gameContainer",
    component: () => import("../pages/GameContainerView.vue"),
    children: [
      {
        path: "game001",
        component: () => import("../games/Game001/index.vue"),
        params: true,
      },
    ],
  },
];

export const router = createRouter({
  routes,
  history: createWebHashHistory(),
});
