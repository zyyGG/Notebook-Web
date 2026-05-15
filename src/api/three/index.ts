import request from "../index";
export async function getMenuList() {
  return [
    // {
    //   id: 1,
    //   name: "模板",
    //   path: "/threejs/template",
    //   tags: [],
    // },
    {
      id: "21e4b928-d651-4f81-96d6-e7e34fdf2f0c",
      name: "基础",
      path: "/threejs/002",
      tags: [],
    },
    {
      id: "aecdd0a2-9c6b-45eb-b000-79fb4a48aa6d",
      name: "菲涅尔边缘光",
      path: "/threejs/003",
      tags: []
    },
    {
      id: "eb5bac1d-e8b8-444a-811d-50ec23588289",
      name: "WEBGPU/TSL",
      path: "/threejs/004",
      tags: []
    },
    {
      id: "42329660-94e1-4c16-a25a-89ea7e902fec",
      name: "WEBGPU/实例化生成",
      path: "/threejs/005",
      tags: []
    },
    {
      id: "bf09dbc0-bc58-4fc8-b41d-892a8448d26e",
      name: "WEBGPU/后处理",
      path: "/threejs/006",
      tags: []
    },
    {
      id: "d9fbad89-03b1-4c61-8f4a-f17689fb9c6d",
      name: "WEBGPU/Bloom选择性发光",
      path: "/threejs/007",
      tags: []
    },
    /// replace-flag
  ];
}
