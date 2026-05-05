import fs from "node:fs"
import path from "node:path"
import chalk from "chalk"

import { spawn } from "child_process"

export default function (type = "base") {
  switch(type) {
    // 只发布assets, favicon.ico, index.html
    case "base":
      // publishToServer(list)
      publishToServer(["assets", "favicon.ico", "index.html"]);
      break;
    // 整个dist文件夹发布到服务器
    case "all":
      publishToServer(["."]);
      break;
    // 其他的情况就是默认发布指定的目录
    default:
      fs.existsSync(path.resolve(process.cwd(), "dist", type)) || (console.error(chalk.red(`未找到要发布的目录: ${type}`)), process.exit(1));
      publishToServer([type]);
      break;
  }
}


async function publishToServer(files) {
  const envConfig = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf-8");
  const serverAddress = envConfig.match(/VITE_PUBLISH_SERVER_ADDRESS\s*=\s*(.+)/)?.[1]?.trim();
  const localPath = envConfig.match(/VITE_PUBLISH_LOCAL_PATH\s*=\s*(.+)/)?.[1]?.trim();
  if(!serverAddress || !localPath) {
    console.error("未配置发布服务器地址或本地发布路径，请设置环境变量 VITE_PUBLISH_SERVER_ADDRESS 和 VITE_PUBLISH_LOCAL_PATH");
    return;
  }

  if(files && files.length > 0) {
    const fileList = files.map((file) => path.resolve(localPath, file));
    const args = ["-r", ...fileList, serverAddress];
    console.log(chalk.blue(`正在发布到服务器: ${serverAddress}...`));
    // 直接继承终端 stdio，确保实时输出 scp 过程信息。
    const publishProcess = spawn("scp", args, {
      stdio: "inherit",
      // shell: process.platform === "win32",
    });

    publishProcess.on("error", (error) => {
      console.error(chalk.red(`启动 scp 失败: ${error.message}`));
    });

    publishProcess.on("close", (code) => {
      if(code === 0) {
        console.log(chalk.green("发布成功"));
      } else {
        console.error(chalk.red(`发布失败，退出码: ${code}`));
      }
    });
  }
  
  
  
}
