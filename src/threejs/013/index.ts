import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js"; // GUI工具
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
  let camera = null as unknown as THREE.PerspectiveCamera;
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({stencil: true, alpha: false});
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

  let update = () => {}


  function createClippingPlanes(geometry: THREE.BufferGeometry, plane: THREE.Plane, renderOrder: number){
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      colorWrite: false,
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
    })

    // 背面
    const backMaterial = baseMaterial.clone();
    backMaterial.side = THREE.BackSide;
    backMaterial.stencilFail = THREE.IncrementStencilOp 
    backMaterial.stencilZFail = THREE.IncrementStencilOp
    backMaterial.stencilZPass = THREE.IncrementStencilOp
    backMaterial.clippingPlanes = [plane];

    const meshBack = new THREE.Mesh(geometry, backMaterial);
    meshBack.renderOrder = renderOrder;
    group.add(meshBack);

    // 正面
    const frontMaterial = baseMaterial.clone();
    frontMaterial.side = THREE.FrontSide;
    frontMaterial.stencilFail = THREE.DecrementStencilOp
    frontMaterial.stencilZFail = THREE.DecrementStencilOp
    frontMaterial.stencilZPass = THREE.DecrementStencilOp
    frontMaterial.clippingPlanes = [plane];
    
    const meshFront = new THREE.Mesh(geometry, frontMaterial);
    meshFront.renderOrder = renderOrder;
    group.add(meshFront);

    return group
  }

  // 核心函数写在这里
  function main() {
    renderer.localClippingEnabled = true;
    const gl = renderer.getContext();
    console.log(gl.getParameter(gl.STENCIL_BITS)); // 输出当前WebGL上下文的模板缓冲区位数
    // 创建展示模型
    // const group = new THREE.Group();
    // 扭结
    const geometry = new THREE.TorusKnotGeometry(1, 0.4, 128, 60);
    const object = new THREE.Group();
    scene.add(object);
    
    // 创建三个切割平面
    const planes = [
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), // x轴切割平面
      new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), // y轴切割平面
      new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)  // z轴切割平面
    ]
    const planeMeshs: THREE.Mesh[] = []
    const planeGeo = new THREE.PlaneGeometry(4, 4);
    const planeHelpers = new THREE.Group();
    scene.add(planeHelpers);
    planes.forEach((plane, index) => {
      const planeHelper = new THREE.PlaneHelper(plane, 4, new THREE.Color(0xffffff));
      planeHelpers.add(planeHelper);
    })

    for(let i = 0 ; i < 3; i++){
      const plane = planes[i];
      
      const stencilGroup = createClippingPlanes(geometry, plane, i);
      // stencilGroup.renderOrder = i;
      const planeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xff0000),
        metalness: 0.84,
        roughness: 0.2,
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
        clippingPlanes: planes.filter(p => p !== plane),
      })
      const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
      planeMesh.renderOrder = i + 0.1;
      planeMesh.onAfterRender = (renderer) => {
        renderer.clearStencil();
      }
      object.add(stencilGroup);
      scene.add(planeMesh);
      planeMeshs.push(planeMesh);
    }

    // 创建前景对象
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x00ff00),
      metalness: 0.84,
      roughness: 0.2,
      clippingPlanes: planes,
      // clipShadows: true
    })
    // material.clipIntersection = true
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 6;
    object.add(mesh);

    // gui
    const params = {
      planeXConstant: 0,
      planeXNegative: false,
      planeYConstant: 0,
      planeYNegative: false,
      planeZConstant: 0,
      planeZNegative: false,
      animation: true,
    }

    const planeXFolder = gui.addFolder("Plane X");
    planeXFolder.open();
    planeXFolder.add(params, "planeXConstant", -2, 2, 0.01).onChange((value) => {
      planes[0].constant = value;
    })
    planeXFolder.add(params, "planeXNegative").name("裁切反转").onChange((value) => {
      planes[0].negate();
    })
    const planeYFolder = gui.addFolder("Plane Y");
    planeYFolder.open();
    planeYFolder.add(params, "planeYConstant", -2, 2, 0.01).onChange((value) => {
      planes[1].constant = value;
    })
    planeYFolder.add(params, "planeYNegative").name("裁切反转").onChange((value) => {
      planes[1].negate();
    })
    const planeZFolder = gui.addFolder("Plane Z");
    planeZFolder.open();
    planeZFolder.add(params, "planeZConstant", -2, 2, 0.01).onChange((value) => {
      planes[2].constant = value;
    })
    planeZFolder.add(params, "planeZNegative").name("裁切反转").onChange((value) => {
      planes[2].negate();
    })
    const animationFolder = gui.addFolder("Animation");
    animationFolder.open();
    animationFolder.add(params, "animation").name("动画开关");
  
    update = () => {
      if(params.animation) {
        object.rotation.x += 0.001;
        object.rotation.y += 0.001;
      }
      planes.forEach((plane, index) => {
        const planeMesh = planeMeshs[index];
        plane.coplanarPoint(planeMesh.position);
        planeMesh.lookAt(
          planeMesh.position.x - plane.normal.x,
          planeMesh.position.y - plane.normal.y,
          planeMesh.position.z - plane.normal.z
        )
      })
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
    control.update();
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
