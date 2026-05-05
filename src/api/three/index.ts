import request from "../index";
export async function getMenuList() {
  return [
    {
      id: 1,
      name: "模板",
      path: "/threejs/template",
      tags: [],
    },
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
    /// replace-flag
  ];
}
