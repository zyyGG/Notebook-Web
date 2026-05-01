import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export default function(projectName) {
  removeFiles(projectName);
  removeRoute(projectName);
  removeMenu(projectName);
}


function removeFiles(projectName) {
  const projectPath = path.join(process.cwd(), 'src', 'threejs', projectName);
  if( fs.existsSync(projectPath) ) {
    fs.rmSync(projectPath, { recursive: true, force: true });
    console.log(chalk.green(`成功删除 ${projectName} 相关文件`));
  } else {
    console.error(chalk.red(`未找到 ${projectName} 相关文件`));
  }
}

function removeRoute(projectName) {
  const routesPath = path.join(process.cwd(), 'src', 'router', 'index.ts');
  if( fs.existsSync(routesPath) ) {
    let content = fs.readFileSync(routesPath, 'utf-8');
    // { path: '/threejs/001', component: () => import('../threejs/001/index.vue') },
    const routeRegex = new RegExp(
      `\\{[\\s\\n\\r]*path:\\s*["']${projectName}["'],[\\s\\n\\r]*component:\\s*\\(\\)\\s*=>\\s*import\\(["'][^"']*${projectName}[^"']*["']\\),[\\s\\n\\r]*\\},?`,
      'g'
    );
    
    content = content.replace(routeRegex, '');
    fs.writeFileSync(routesPath, content, 'utf-8');
    console.log(chalk.green(`成功删除 ${projectName} 的路由配置`));
  } else {
    console.error(chalk.red(`未找到路由配置文件`));
  }
}

function removeMenu(projectName) {
  const menuPath = path.join(process.cwd(), 'src', 'threejs', 'menuList.json');
  if( fs.existsSync(menuPath) ) {
    let menuList = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
    menuList = menuList.filter(item => item.path !== `/threejs/${projectName}`);
    fs.writeFileSync(menuPath, JSON.stringify(menuList, null, 2), 'utf-8');
    console.log(chalk.green(`成功删除 ${projectName} 的菜单配置`));
  } else {
    console.error(chalk.red(`未找到菜单配置文件`));
  }
}