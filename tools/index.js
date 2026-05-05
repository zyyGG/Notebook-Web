import process from "process";
import createThreejsTemplate from "./createThreejsTemplate.js"
import removeThreejsFiles from "./removeThreejsFiles.js"
import publish from "./publish.js"

import chalk from "chalk";

const args = process.argv.slice(2);

switch(args[0]){
  case "create:three":
    // 参数检查
    if(args.length < 3) {
      console.error(chalk.red("无效的参数: npm run create:three [projectname] [labelname]"));
      process.exit(1);
    }
    createThreejsTemplate(args[1], args[2]);
    break;
  case "remove:three":
    if(args.length < 2) {
      console.error(chalk.red("无效的参数: npm run remove:three [projectname]"));
      process.exit(1);
    }
    removeThreejsFiles(args[1]);
    break;
  case "publish":
    publish(args[1] || "base");
    break;
}
