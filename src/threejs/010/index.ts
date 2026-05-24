import * as THREE from "three/webgpu";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { sin, length, color, linearDepth, mix, uniform, step , abs, sub, range, pass,vec2, positionLocal, Fn, rotateUV, time, uv,vec3, varying, float } from "three/tsl";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
  let camera = null as unknown as THREE.PerspectiveCamera;
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
  let control = null as unknown as OrbitControls;

  // 核心函数写在这里
  function main() {
    gridHelper.visible = false;
    directionalLightHelper.visible = false;
    axesHelper.visible = false;
    camera.position.set(0, 0, 1.5);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.NodeMaterial(),
    )
    scene.add(cube)

    // const checkerColor = positionLocal.mul(4.9999).fract()
    // cube.material.fragmentNode = vec3(checkerColor.x.step(0.5), checkerColor.y.step(0.5), checkerColor.z.step(0.5))
    // cube.material.fragmentNode = positionLocal.length().mul(15).fract().smoothstep(0.49, 0.5) // 使用smoothstep平滑边缘
    cube.material.fragmentNode = Fn(() => {
      const p = positionLocal.toVar();

      p.mulAssign(5)
      p.assign(p.fract().sub(0.5))
      p.assign(length(p))
      p.assign(sin(p.mul(10).add(time)))
      p.assign(p.abs())
      p.assign(p.x.step(0.5))

      return p
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
    const width = body.clientWidth;
    const height = body.clientHeight;

    await renderer.init();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    body.appendChild(renderer.domElement);
    body.appendChild(stats.dom);
    stats.dom.style.position = "absolute";

    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 8;
    camera.position.y = 4;
    camera.lookAt(0, 0, 0);

    control = new OrbitControls(camera, renderer.domElement);

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
    const parent = renderer.domElement.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
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
