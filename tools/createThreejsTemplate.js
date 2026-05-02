import fs from "fs";
import path from "path";
import chalk from "chalk";
import { randomUUID } from "node:crypto";

export default function (projectName, labelName) {
  createFile(projectName);
  createRoute(projectName);
  createMenu(projectName, labelName);
}

function createFile(projectName) {
  const vueTemplate = fs.readFileSync(path.join(process.cwd(), "src", "threejs", "template", "index.vue"), "utf-8");
  const tsTemplate = fs.readFileSync(path.join(process.cwd(), "src", "threejs", "template", "index.ts"), "utf-8");
  const projectPath = path.join(process.cwd(), "src", "threejs", projectName);
  if (fs.existsSync(projectPath)) {
    console.warn(chalk.yellow(`文件夹已存在: ${projectName}`));
  } else {
    fs.mkdirSync(projectPath);
    fs.writeFileSync(path.join(projectPath, "index.vue"), vueTemplate);
    console.log(chalk.green(`已创建文件: ${projectName}/index.vue`));
    fs.writeFileSync(path.join(projectPath, "index.ts"), tsTemplate);
    console.log(chalk.green(`已创建文件: ${projectName}/index.ts`));
  }
}

function createRoute(projectName) {
  // 写入路由配置文件
  const routeTemplate = `{
        path: "${projectName}",
        component: () => import("../threejs/${projectName}/index.vue"),
      },
      /// replace-flag
  `;
  const routerFilePath = path.join(process.cwd(), "src", "router", "index.ts");
  let routerFileContent = fs.readFileSync(routerFilePath, "utf-8");
  // 先匹配一些是否存在
  if (routerFileContent.includes(`path: "${projectName}"`)) {
    console.warn(chalk.yellow(`路由配置已存在: ${projectName}`));
  } else {
    routerFileContent = routerFileContent.replace(
      "/// replace-flag",
      routeTemplate,
    );
    fs.writeFileSync(routerFilePath, routerFileContent);
    console.log(chalk.green(`已更新路由配置: ${projectName}`));
  }
}

function createMenu(projectName, labelName) {
  // 写入菜单配置文件
  const menuList = fs.readFileSync(
    path.join(process.cwd(), "src", "threejs", "menuList.json"),
    "utf-8",
  );
  const menuListTemplate = {
    id: randomUUID(),
    name: labelName,
    path: `/threejs/${projectName}`,
    tags: [],
  };
  if (menuList.includes(`"path": "/threejs/${projectName}"`)) {
    console.warn(chalk.yellow(`菜单配置已存在: ${projectName}`));
  } else {
    const menuListJson = JSON.parse(menuList);
    menuListJson.push(menuListTemplate);
    fs.writeFileSync(
      path.join(process.cwd(), "src", "threejs", "menuList.json"),
      JSON.stringify(menuListJson, null, 2),
    );
    console.log(chalk.green(`已更新菜单配置: ${projectName}`));
  }
}
