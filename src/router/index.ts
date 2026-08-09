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
  {
    path: "/threejs",
    component: () => import("../pages/ThreejsView.vue"),
    children: [
      {
        path: "template",
        component: () => import("../threejs/template/index.vue"),
      },
      {
        path: "002",
        component: () => import("../threejs/002/index.vue"),
      },
      {
        path: "003",
        component: () => import("../threejs/003/index.vue"),
      },
      {
        path: "004",
        component: () => import("../threejs/004/index.vue"),
      },
      {
        path: "005",
        component: () => import("../threejs/005/index.vue"),
      },
      {
        path: "006",
        component: () => import("../threejs/006/index.vue"),
      },
      {
        path: "007",
        component: () => import("../threejs/007/index.vue"),
      },
      {
        path: "008",
        component: () => import("../threejs/008/index.vue"),
      },
      {
        path: "009",
        component: () => import("../threejs/009/index.vue"),
      },
      {
        path: "010",
        component: () => import("../threejs/010/index.vue"),
      },
      {
        path: "011",
        component: () => import("../threejs/011/index.vue"),
      },
      {
        path: "012",
        component: () => import("../threejs/012/index.vue"),
      },
      {
        path: "013",
        component: () => import("../threejs/013/index.vue"),
      },
      {
        path: "014",
        component: () => import("../threejs/014/index.vue"),
      },
      {
        path: "015",
        component: () => import("../threejs/015/index.vue"),
      },
      /// replace-flag
  
  
  
  
  
  
  
    ]
  }
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
