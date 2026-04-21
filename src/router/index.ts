import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../pages/HomeView.vue"),
    children: [
      {
        path: "/diary",
        component: () => import("../pages/DiaryView.vue"),
      },
    ]
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
      {
        path: "game002",
        component: () => import("../games/Game002/index.vue"),
        params: true,
      }
    ],
  },
];

if(import.meta.env.DEV) {
  routes.push({
    path: "/gameDemo",
    component: () => import("../games/GameDemo/index.vue"),
  })
}

export const router = createRouter({
  routes,
  history: createWebHashHistory(),
});
