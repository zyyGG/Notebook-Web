import process from "process";
import createThreejsTemplate from "./createThreejsTemplate.js"

const args = process.argv.slice(2);

switch(args[0]){
  case "threejs":
    createThreejsTemplate(args[1]);
    break;
  
}
