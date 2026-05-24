import * as THREE from "three/webgpu";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { 
  color,
  If,
  linearDepth,
  viewportLinearDepth,
  mix,
  depth,
  viewportSharedTexture,
  saturation,
  oscSine,
  hue,
  vec3,
  vec4,
  uniform,
 } from "three/tsl";
import { Fn } from "three/src/nodes/TSL.js";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

  // 核心函数写在这里
  function main() {
    gridHelper.visible = false;
    directionalLightHelper.visible = false;
    axesHelper.visible = false;

    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.NodeMaterial()
    )
    scene.add(cube)
    // fragmentNode 这个可以避免光照和其他的计算影响到结果
    cube.material.fragmentNode = linearDepth()
    // colorNode, 这个值会参与到接下来fragmentNode的计算中
    

    // const floor = new THREE.Mesh(
    //   new THREE.BoxGeometry(100, 0.1, 100),
    //   new THREE.MeshStandardNodeMaterial({ color: 0x999999 })
    // )

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 32),
      new THREE.MeshStandardNodeMaterial({ color: 0x999999 })
    )
    ball.position.x = 20
    scene.add(ball)

    // const transparentBox = new THREE.Mesh(
    //   new THREE.BoxGeometry(10, 10, 10),
    //   new THREE.MeshStandardNodeMaterial({ color: 0x999999 })
    // )
    // transparentBox.position.set(10, 10, 0)
    // transparentBox.material.transparent = true;

    // scene.add(cube, floor, ball, transparentBox)

    // 通过计算线性深度值到视口线性深度值, 来获取一个距离值
    // viewportLinearDepth 返回的是场景的线性深度
    // linearDepth 返回的是片元的线性深度
    
    // const depth = linearDepth()
    // const viewportDepth = viewportLinearDepth
    // transparentBox.material.colorNode = depth
    // ball.material.colorNode = depth
    // cube.material.colorNode = viewportDepth
    // const material = new THREE.NodeMaterial();
    // // @ts-ignore
    // cube.material = material;
    // cube.material.colorNode = color(1, 0, 0);

    renderer.debug.getShaderAsync(scene, camera, cube)
    .then(shader => {
      console.log(shader.fragmentShader)
    })

    
    
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

    scene.background = new THREE.Color(0x333333);
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
    renderer.render(scene, camera);
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
