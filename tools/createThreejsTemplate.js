import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { randomUUID } from 'node:crypto';

export default function (fileName) {
  // 写入Vue组件文件
  const vueTemplate = `
    <template>
      <div class="w-full h-full border border-red">
        hello wolrd
      </div>
    </template>
    <script lang="ts" setup>
    import {ref, onMounted } from "vue"

    </script>
    <style lang="scss" scoped>
      
    </style>
  `
  createFile(path.join(process.cwd(), "src", "threejs", fileName, "index.vue"), vueTemplate);

  // 写入路由配置文件
  const routeTemplate = `{
        path: "${fileName}",
        component: () => import("../threejs/${fileName}/index.vue"),
      },
      /// replace-flag
  `
  const routerFilePath = path.join(process.cwd(), "src", "router", "index.ts");
  let routerFileContent = fs.readFileSync(routerFilePath, "utf-8");
  // 先匹配一些是否存在
  if(routerFileContent.includes(`path: "${fileName}"`)) {
    console.warn(chalk.yellow(`路由配置已存在: ${fileName}`));
  } else {
    routerFileContent = routerFileContent.replace("/// replace-flag", routeTemplate);
    fs.writeFileSync(routerFilePath, routerFileContent);
    console.log(chalk.green(`已更新路由配置: ${fileName}`));
  }
  

  // 写入菜单配置文件
  const menuList = fs.readFileSync(path.join(process.cwd(), "src", "threejs", "menuList.json"), "utf-8");
  const menuListTemplate = {
    id: randomUUID(),
    name: (fileName.split("_")[1] || fileName),
    path: `/threejs/${fileName}`,
    tags: []
  }
  if(menuList.includes(`"path": "/threejs/${fileName}"`)) {
    console.warn(chalk.yellow(`菜单配置已存在: ${fileName}`));
  } else {
    const menuListJson = JSON.parse(menuList);
    menuListJson.push(menuListTemplate);
    fs.writeFileSync(path.join(process.cwd(), "src", "threejs", "menuList.json"), JSON.stringify(menuListJson, null, 2));
    console.log(chalk.green(`已更新菜单配置: ${fileName}`));
  }
  
}

function createFile(filePath, content) {
  const parentDir = path.dirname(filePath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  if (fs.existsSync(filePath)) {
    console.warn(chalk.yellow(`文件已存在: ${filePath}`));
    return;
  }
  fs.writeFileSync(filePath, content);
  console.log(chalk.green(`已创建文件: ${filePath}`));
}