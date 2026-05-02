import * as THREE from "three";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { m } from "vue-router/dist/router-CWoNjPRp.mjs";

export default function () {
  
  let isInit = false;
  const gui = new GUI({
  });
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
  const control = new OrbitControls(camera, renderer.domElement);

  // 核心函数写在这里
  function main() {

    // 关闭辅助器
    gridHelper.visible = false;
    axesHelper.visible = false;
    directionalLightHelper.visible = false;
    control.enablePan = false; // 禁止平移
    
    // 创建一个立方体
    const shape = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
    scene.add(shape);


    // gui
    const geometryFolder = gui.addFolder("几何体");
    geometryFolder.open();
    const geometryOptions = [
      { name: "立方体", geometry: new THREE.BoxGeometry() },
      { name: "球体", geometry: new THREE.SphereGeometry(0.5, 32, 32) },
      { name: "圆柱体", geometry: new THREE.CylinderGeometry(0.5, 0.5, 1, 32) },
      { name: "圆锥体", geometry: new THREE.ConeGeometry(0.5, 1, 32) },
      { name: "环形体", geometry: new THREE.TorusGeometry(0.5, 0.2, 16, 100) },
      { name: "平面", geometry: new THREE.PlaneGeometry(1, 1) },
      { name: "多边形", geometry: new THREE.CircleGeometry(0.5, 32) },
      { name: "正四面体", geometry: new THREE.TetrahedronGeometry(0.5) },
      { name: "正八面体", geometry: new THREE.OctahedronGeometry(0.5) },
      { name: "正二十面体", geometry: new THREE.IcosahedronGeometry(0.5) },
    ]
    
    geometryFolder.add({ geometry: geometryOptions[0].name }, "geometry", geometryOptions.map(o => o.name)).name("几何体").onChange((value) => {
      const selected = geometryOptions.find(o => o.name === value);
      if (selected) {
        shape.geometry = selected.geometry as any;
      }
    });


    const param = {
      wireframe: false,
    }
    const standardMaterial: any = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const basicMaterial: any = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const lambertMaterial: any = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const normalMaterial: any = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    const materialOptions = [
      { 
        name: "标准材质", 
        callback: () => {
          standardMaterial.wireframe = param.wireframe;
          shape.material = standardMaterial;
        }
      },
      { 
        name: "基础材质", 
        callback: () => {
          basicMaterial.wireframe = param.wireframe;
          shape.material = basicMaterial;
        }
      },
      { 
        name: "朗伯材质", 
        callback: () => {
          lambertMaterial.wireframe = param.wireframe;
          shape.material = lambertMaterial;
        }
      },
      {
        name: "法线材质",
        callback: () => {
          shape.material = normalMaterial;
        }
      }
    ]
    const materialFolder = gui.addFolder("材质");

    materialFolder.open();
    materialFolder.add({ material: materialOptions[0].name }, "material", materialOptions.map(o => o.name)).name("材质").onChange((value) => {
      const selected = materialOptions.find(o => o.name === value);
      if (selected) {
        selected.callback && selected.callback();
      }
    });

    materialFolder.add(param, "wireframe").name("线框").onChange((value) => {
      if(
        shape.material as any instanceof THREE.MeshStandardMaterial || 
        shape.material as any instanceof THREE.MeshBasicMaterial ||
        shape.material as any instanceof THREE.MeshLambertMaterial
      ) {
        shape.material.wireframe = value;
      }
    });
  }

  function update() {
    control.update();
  }

  function initHelper() {
    
    
  }

  // 场景初始化
  function init(body: HTMLElement){
    if(isInit) return;
    isInit = true;
    initHelper();
    window.addEventListener("resize", handleResize);

    renderer.setSize(window.innerWidth, window.innerHeight);
    body.appendChild(renderer.domElement);

    camera.position.z = 5;
    camera.position.y = 2;

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

