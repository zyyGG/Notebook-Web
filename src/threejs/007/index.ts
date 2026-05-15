import * as THREE from "three/webgpu";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { color, linearDepth, mix, uniform, step , abs, sub, range, pass, mrt, output, vec4, vec3, velocity, depth, viewportLinearDepth, emissive, diffuseColor, Fn } from "three/tsl";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20);
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGPURenderer({ antialias: true });
  let requestId: number | null = null;
  // 平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.5);
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  // 轴辅助
  const axesHelper = new THREE.AxesHelper(5);
  // 网格辅助
  const gridHelper = new THREE.GridHelper(10, 10, new THREE.Color(0xff0000), new THREE.Color(0x888888));

  // 轨道控制器
  const control = new OrbitControls(camera, renderer.domElement);


  const renderPipeline = new THREE.RenderPipeline(renderer); // 新的渲染管线用来替代旧的effectcomposer

  // 核心函数写在这里
  function main() {
    gridHelper.visible = false;
    directionalLightHelper.visible = false;
    axesHelper.visible = false;
    scene.background = new THREE.Color(0x888888);

    // 原理:
    // bloom效果可以说是对整个屏幕来进行的
    // 所以需要约束范围
    // 通过材质中的emissive属性来决定发光的部分, 这个也正好是发光材质使用的属性
    // 使用mrt来获取正常渲染的颜色和发光的颜色
    // 最后让发光颜色经过bloom处理后变为 bloom通道,此时发光颜色有了,只是背景变黑了
    // 最后把正常颜色和bloom颜色混合在一起输出

    const cube1 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({color: 0xff0000})
    )
    scene.add(cube1);

    const cube2 = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00f0f0,
        opacity: 0.0,
        transparent: true,
      })
    )
    scene.add(cube2);
    cube2.position.x = 2;

    const scenePass = pass(scene, camera)
    const mrtNode = mrt({
      output: output,
      emissive: vec4(emissive, 1.0),
    })
    scenePass.setMRT(mrtNode)

    renderPipeline.outputNode = Fn(() => {
      const outputNode = scenePass.getTextureNode("output");
      const emissiveNode = scenePass.getTextureNode("emissive");  
      const bloomNode = bloom(emissiveNode);
      const finalColor = outputNode.add(bloomNode);

      return finalColor;
    })()

  }

  function update() {
    control.update();
  }

  function initHelper() {
    
  }

  // 场景初始化
  async function init(body: HTMLElement){
    if(isInit) return;
    isInit = true;
    initHelper();
    window.addEventListener("resize", handleResize);

    await renderer.init();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    body.appendChild(renderer.domElement);
    body.appendChild(stats.dom);
    stats.dom.style.position = "absolute";

    camera.position.z = 8;
    camera.position.y = 4;
    camera.lookAt(0, 0, 0);

    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    directionalLightHelper.update();
    scene.add(directionalLightHelper);

    scene.add(ambientLight);

    scene.add(axesHelper);

    scene.add(gridHelper);
    main();
  }

  // 渲染
  function render() {
    update();
    renderPipeline.render();
    stats.update();
    requestId = requestAnimationFrame(render);
  }

  function disposeMaterial(material: THREE.Material) {
    const mat = material as THREE.Material & Record<string, any>;
    for (const key of Object.keys(mat)) {
      const value = mat[key];
      if (value && typeof value === "object" && value.isTexture) {
        value.dispose();
      }
    }
    material.dispose();
  }

  function disposeObject3D(obj: THREE.Object3D) {
    const anyObj = obj as any;

    if (anyObj.geometry && typeof anyObj.geometry.dispose === "function") {
      anyObj.geometry.dispose();
    }

    if (anyObj.material) {
      if (Array.isArray(anyObj.material)) {
        anyObj.material.forEach((m: THREE.Material) => disposeMaterial(m));
      } else {
        disposeMaterial(anyObj.material as THREE.Material);
      }
    }

    if (typeof anyObj.dispose === "function") {
      anyObj.dispose();
    }
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function destory() {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }

    control.dispose();

    scene.traverse((obj) => {
      disposeObject3D(obj);
    });
    scene.clear();

    const rendererAny = renderer as THREE.WebGPURenderer & {
      renderLists?: { dispose?: () => void };
      forceContextLoss?: () => void;
    };
    rendererAny.renderLists?.dispose?.(); // WebGLRenderer兼容清理
    renderer.dispose(); // 释放渲染器资源
    rendererAny.forceContextLoss?.(); // WebGLRenderer兼容清理
    renderer.domElement.remove(); // 从DOM中移除canvas元素

    // 清理gui
    gui.destroy();

    // 清理事件监听
    window.removeEventListener("resize", handleResize);

    isInit = false;
  }

  return {
    init,
    render,
    destory
  }
}
