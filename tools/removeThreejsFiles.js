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

    const routeRegex = new RegExp(
      `\\{[\\s\\n\\r]*path:\\s*["']${projectName}["'],[\\s\\n\\r]*component:\\s*\\(\\)\\s*=>\\s*import\\(["'][^"']*${projectName}[^"']*["']\\),[\\s\\n\\r]*\\},?[\\s\\n\\r]*`,
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
  const menuPath = path.join(process.cwd(), 'src', 'api/three', 'index.ts');
  if( fs.existsSync(menuPath) ) {
    let content = fs.readFileSync(menuPath, 'utf-8');
    const menuRegex = new RegExp(
      // 包含下一行的replace-flag，确保只删除对应的菜单项
      `\\{[\\s\\n\\r]*id:\\s*["'][^"']*["'],[\\s\\n\\r]*name:\\s*["'][^"']*["'],[\\s\\n\\r]*path:\\s*["']/threejs/${projectName}["'],[\\s\\n\\r]*tags:\\s*\\[[^\\]]*\\][\\s\\n\\r]*\\},?[\\s\\n\\r]*`,
      'g'
    );

    content = content.replace(menuRegex, '');
    fs.writeFileSync(menuPath, content, 'utf-8');
    console.log(chalk.green(`成功删除 ${projectName} 的菜单配置`));
  } else {
    console.error(chalk.red(`未找到菜单配置文件`));
  }
}