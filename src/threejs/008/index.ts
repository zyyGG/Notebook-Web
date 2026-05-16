import * as THREE from "three/webgpu";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { uv, time, color, linearDepth, mix, uniform, step , abs, sub, range, pass, vec3, vec2, vec4, 
  mx_noise_float, 
  mx_noise_vec3,
  mx_noise_vec4,
  mx_fractal_noise_float, 
  mx_fractal_noise_vec2,
  mx_fractal_noise_vec3,
  mx_fractal_noise_vec4,
  mx_worley_noise_float,
  mx_worley_noise_vec2,
  mx_worley_noise_vec3,
  mx_cell_noise_float,
} from "three/tsl";

export default function () {
  
  let isInit = false;
  const gui = new GUI({
    autoPlace: false,
  });
  let guiStyleEl: HTMLStyleElement | null = null;
  let body : HTMLElement | null = null;
  const stats = new Stats()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
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

    let mesh: THREE.Mesh | null = null;
    const geometry = new THREE.PlaneGeometry(20, 20);

    let noiseFolder : GUI | null = null;
    
    gui.add({selects: "noise"}, "selects", [
      "noise_float", 
      "noise_vec3",
      "noise_vec4",
      "fractal_noise_float", 
      "fractal_noise_vec2",
      "fractal_noise_vec3",
      "fractal_noise_vec4",
      "worley_noise_float",
      "worley_noise_vec2",
      "worley_noise_vec3",
      "cell_noise_float",
    ]).name("选择").onChange((value) => {
      if(mesh && "dispose" in mesh.material) {
        mesh.material.dispose();
      }
      noiseFolder && gui.removeFolder(noiseFolder);
      noiseFolder = gui.addFolder("噪波参数");
      if(value === "noise_float") noise_float();
      else if(value === "noise_vec3") noise_vec3();
      else if(value === "noise_vec4") noise_vec4();
      else if(value === "fractal_noise_float") fractal_noise_float();
      else if(value === "fractal_noise_vec2") fractal_noise_vec2();
      else if(value === "fractal_noise_vec3") fractal_noise_vec3();
      else if(value === "fractal_noise_vec4") fractal_noise_vec4();
      else if(value === "worley_noise_float") worley_noise_float();
      else if(value === "worley_noise_vec2") worley_noise_vec2();
      else if(value === "worley_noise_vec3") worley_noise_vec3();
      else if(value === "cell_noise_float") cell_noise_float();
    })
    noiseFolder = gui.addFolder("噪波参数");
    noise_float()
    
    function noise_float(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const amplitude = uniform(1.0);
      const pivot = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_noise_float(
        uv().mul(uvScale).add(time),
        amplitude,
        pivot,
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
      noiseFolder!.add(pivot, "value", 0, 2).name("枢轴(pivot)");
    }

    function noise_vec3(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const amplitude = uniform(1.0);
      const pivot = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_noise_vec3(
        uv().mul(uvScale).add(time),
        amplitude,
        pivot,
      ), 1.0);
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
      noiseFolder!.add(pivot, "value", 0, 2).name("枢轴(pivot)");
    }

    function noise_vec4(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const amplitude = uniform(1.0);
      const pivot = uniform(1.0);
      const material = new THREE.MeshStandardMaterial({
        transparent: true,
      })
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_noise_vec4(
        uv().mul(uvScale).add(time),
        amplitude,
        pivot,
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
      noiseFolder!.add(pivot, "value", 0, 2).name("枢轴(pivot)");
    }

    function fractal_noise_float(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const octaves = uniform(4.0);
      const lacunarity = uniform(2.0);
      const diminish = uniform(0.5);
      const amplitude = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_fractal_noise_float(
        uv().mul(uvScale).add(time),
        octaves,
        lacunarity,
        diminish,
        amplitude,
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(octaves, "value", 1, 8).name("层数(octaves)");
      noiseFolder!.add(lacunarity, "value", 1, 4).name("频率倍增(lacunarity)");
      noiseFolder!.add(diminish, "value", 0, 1).name("振幅衰减(diminish)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
    }

    function fractal_noise_vec2(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const octaves = uniform(4.0);
      const lacunarity = uniform(2.0);
      const diminish = uniform(0.5);
      const amplitude = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_fractal_noise_vec2(
        uv().mul(uvScale).add(time),
        octaves,
        lacunarity,
        diminish,
        amplitude,
      ), 1.0, 1.0);
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(octaves, "value", 1, 8).name("层数(octaves)");
      noiseFolder!.add(lacunarity, "value", 1, 4).name("频率倍增(lacunarity)");
      noiseFolder!.add(diminish, "value", 0, 1).name("振幅衰减(diminish)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
    }

    function fractal_noise_vec3(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const octaves = uniform(4.0);
      const lacunarity = uniform(2.0);
      const diminish = uniform(0.5);
      const amplitude = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_fractal_noise_vec3(
        uv().mul(uvScale).add(time),
        octaves,
        lacunarity,
        diminish,
        amplitude,
      ), 1.0);
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(octaves, "value", 1, 8).name("层数(octaves)");
      noiseFolder!.add(lacunarity, "value", 1, 4).name("频率倍增(lacunarity)");
      noiseFolder!.add(diminish, "value", 0, 1).name("振幅衰减(diminish)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
    }

    function fractal_noise_vec4(){
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const octaves = uniform(4.0);
      const lacunarity = uniform(2.0);
      const diminish = uniform(0.5);
      const amplitude = uniform(1.0);
      const material = new THREE.MeshStandardMaterial({
        transparent: true,
      })
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_fractal_noise_vec4(
        uv().mul(uvScale).add(time),
        octaves,
        lacunarity,
        diminish,
        amplitude,
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(octaves, "value", 1, 8).name("层数(octaves)");
      noiseFolder!.add(lacunarity, "value", 1, 4).name("频率倍增(lacunarity)");
      noiseFolder!.add(diminish, "value", 0, 1).name("振幅衰减(diminish)");
      noiseFolder!.add(amplitude, "value", 0, 5).name("振幅(amplitude)");
    }


    function worley_noise_float() {
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const jitter = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_worley_noise_float(
        uv().mul(uvScale).add(time),
        jitter,
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(jitter, "value", 0, 1).name("抖动(jitter)");
    }

    function worley_noise_vec2() {
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const jitter = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_worley_noise_vec2(
        uv().mul(uvScale).add(time),
        jitter,
      ), 1.0, 1.0);
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(jitter, "value", 0, 1).name("抖动(jitter)");
    }

    function worley_noise_vec3() {
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const jitter = uniform(1.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_worley_noise_vec3(
        uv().mul(uvScale).add(time),
        jitter,
      ), 1.0);
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
      noiseFolder!.add(jitter, "value", 0, 1).name("抖动(jitter)");
    }

    function cell_noise_float() {
      scene.remove(mesh!);
      const uvScale = uniform(5.0);
      const material = new THREE.MeshStandardMaterial()
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      material.colorNode = vec4(mx_cell_noise_float(
        uv().mul(uvScale).add(time),
      ));
      noiseFolder!.open();
      noiseFolder!.add(uvScale, "value", 0, 10).name("UV缩放(uvScale)");
    }
  }

  function update() {
    control.update();
  }

  function initHelper() {
    
  }

  function applyGuiSelectTheme() {
    if (!body || guiStyleEl) return;

    gui.domElement.classList.add("noise-gui");
    guiStyleEl = document.createElement("style");
    guiStyleEl.textContent = `
      .noise-gui select {
        background: #1f2937;
        color: #f9fafb;
        border: 1px solid #4b5563;
      }

      .noise-gui select option {
        background: #111827;
        color: #f9fafb;
      }
    `;
    body.appendChild(guiStyleEl);
  }

  // 场景初始化
  async function init(_body: HTMLElement){
    if(isInit) return;
    isInit = true;
    initHelper();
    window.addEventListener("resize", handleResize);
    body = _body;

    await renderer.init();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(body.clientWidth, body.clientHeight);
    body.appendChild(renderer.domElement);
    body.appendChild(stats.dom);
    body.appendChild(gui.domElement);
    stats.dom.style.position = "absolute";
    gui.domElement.style.position = "absolute";
    gui.domElement.style.top = "0";
    gui.domElement.style.right = "0";
    applyGuiSelectTheme();
    
    camera.aspect = body.clientWidth / body.clientHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 50;
    camera.position.y = 10;
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
    if (body) {
      camera.aspect = body.clientWidth / body.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(body.clientWidth, body.clientHeight);
    }
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
    guiStyleEl?.remove();
    guiStyleEl = null;

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
