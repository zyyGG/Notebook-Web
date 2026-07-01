import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
  let camera = null as unknown as THREE.PerspectiveCamera;
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer();
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
  let control = null as unknown as OrbitControls;
  let timer = null as unknown as THREE.Timer;
  let update = () => {}

  
  function main() {
    // 核心函数写在这里

    update = () => {
      const delta = timer.getDelta();
      console.log(delta)
    }
  }

  function initHelper() {
    
  }

  // 场景初始化
  function init(body: HTMLElement){
    if(isInit) return;
    isInit = true;
    initHelper();
    window.addEventListener("resize", handleResize);
    const width = body.clientWidth;
    const height = body.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(width, height);
    body.appendChild(renderer.domElement);
    body.appendChild(stats.dom);
    stats.dom.style.position = "absolute";

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x3d3d3d);

    control = new OrbitControls(camera, renderer.domElement);
    control.enableDamping = true;

    timer = new THREE.Timer();

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
  function render(timestamp: number) {
    update();
    renderer.render(scene, camera);
    stats.update();
    control.update();
    timer.update(timestamp);
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
    const parent = renderer.domElement.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
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

    renderer.renderLists.dispose(); // 释放渲染列表资源
    renderer.dispose(); // 释放渲染器资源
    renderer.forceContextLoss(); // 强制丢失WebGL上下文，释放GPU资源
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
