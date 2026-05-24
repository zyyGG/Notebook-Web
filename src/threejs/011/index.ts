import * as THREE from "three";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function () {
  
  let isInit = false;
  const gui = new GUI();
  const stats = new Stats()
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
  // const control = new OrbitControls(camera, renderer.domElement);
  const expo:any = {}

  // 核心函数写在这里
  function main() {
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);

    const control = new CustomControl(camera, renderer.domElement)
    expo.control = control;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    )
    scene.add(mesh);

    const camearFolder = gui.addFolder("camera")
    camearFolder.add(camera, "fov", 1, 180).name("fov").onChange(() => {
      camera.updateProjectionMatrix();
    });
    camearFolder.open();

    const controlFolder = gui.addFolder("control")
    controlFolder.add(control, "speed", 0.01, 0.1).name("speed");
    controlFolder.open();
  }

  function update() {
    expo.control.update();
  }

  function initHelper() {
   
  }

  class CustomControl {
    velocity: THREE.Vector3 = new THREE.Vector3();
    activeDirections: Set<string> = new Set();
    speed: number = 0.02;

    constructor(public camera: THREE.Camera, public domElement: HTMLElement) {
      this.initEvent();
    }

    initEvent(){
      this.domElement.addEventListener("click", this.onClick.bind(this)); 
      this.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
      this.domElement.addEventListener("keydown", this.onKeyDown.bind(this));
      this.domElement.addEventListener("keyup", this.onKeyUp.bind(this));
      this.domElement.setAttribute("tabindex", "0"); // 使元素可聚焦以接收键盘事件
      this.domElement.focus(); // 自动聚焦以便立即接收键盘输入
    }

    async onClick(event: MouseEvent) {
      if(!document.pointerLockElement) {
        await this.domElement.requestPointerLock(); // 请求指针锁定以捕获鼠标移动
      }
    }

    onKeyDown(event: KeyboardEvent) {
      if(event.repeat) return; // 忽略按键重复事件
      event.preventDefault(); // 阻止默认行为，避免滚动等干扰
      this.activeDirections.add(event.key.toLowerCase());
    }

    onKeyUp(event: KeyboardEvent) {
      if(event.repeat) return; // 忽略按键重复事件
      event.preventDefault(); // 阻止默认行为，避免滚动等干扰
      this.activeDirections.delete(event.key.toLowerCase());
    }

    onMouseMove(event: MouseEvent) {
      if (document.pointerLockElement === this.domElement) {
        const sensitivity = 0.002;
        const yaw = event.movementX * sensitivity;
        const pitch = event.movementY * sensitivity;
        this.camera.rotation.order = "YXZ"; // 设置旋转顺序，确保正确的旋转效果
        this.camera.rotation.y -= yaw; // 水平旋转
        this.camera.rotation.x -= pitch; // 垂直旋转
        // this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x)); // 限制垂直旋转角度
      }
    }

    update() {
      // 通过安检来判断当前的方
      const viewDirection = this.camera.getWorldDirection(new THREE.Vector3()).multiply(new THREE.Vector3(1, 0, 1)).normalize(); // 获取水平视线方向
      if(this.activeDirections.has("w") ) {
        if(this.activeDirections.has("a") || this.activeDirections.has("d") ) {
          this.velocity.add(viewDirection.clone().multiplyScalar(this.speed * Math.SQRT1_2)); // 对角线方向移动，速度乘以1/√2
        } else if(this.activeDirections.has("s") ) {
          this.velocity.add(viewDirection.clone().multiplyScalar(0)); // 前后抵消，不移动
        } else {
          this.velocity.add(viewDirection.clone().multiplyScalar(this.speed)); // 向前移动
        }
      }
      if(this.activeDirections.has("s") ) {
        if(this.activeDirections.has("a") || this.activeDirections.has("d") ) {
          this.velocity.add(viewDirection.clone().multiplyScalar(-this.speed * Math.SQRT1_2)); // 对角线方向移动，速度乘以1/√2
        } else if(this.activeDirections.has("w") ) {
          this.velocity.add(viewDirection.clone().multiplyScalar(0)); // 前后抵消，不移动
        } else {
          this.velocity.add(viewDirection.clone().multiplyScalar(-this.speed)); // 向后移动
        }
      }

      const rightDirection = new THREE.Vector3().crossVectors(viewDirection, this.camera.up).normalize();
      if(this.activeDirections.has("a") ) {
        if(this.activeDirections.has("w") || this.activeDirections.has("s")) {
          this.velocity.add(rightDirection.clone().multiplyScalar(-this.speed * Math.SQRT1_2)); // 对角线方向移动，速度乘以1/√2
        } else if(this.activeDirections.has("d")) {
          this.velocity.add(rightDirection.clone().multiplyScalar(0)); // 左右抵消，不移动
        } else {
          this.velocity.add(rightDirection.clone().multiplyScalar(-this.speed)); // 向左移动
        }
      }
      if(this.activeDirections.has("d")) {
        if(this.activeDirections.has("w")  || this.activeDirections.has("s") ) {
          this.velocity.add(rightDirection.clone().multiplyScalar(this.speed * Math.SQRT1_2)); // 对角线方向移动，速度乘以1/√2
        } else if(this.activeDirections.has("a") ) {
          this.velocity.add(rightDirection.clone().multiplyScalar(0)); // 左右抵消，不移动
        } else {
          this.velocity.add(rightDirection.clone().multiplyScalar(this.speed)); // 向右移动
        }
      }

      if(this.activeDirections.has(" ")) {
        this.velocity.y += this.speed; // 向上移动
      }

      if(this.activeDirections.has("shift")) {
        this.velocity.y -= this.speed; // 向下移动
      }

      this.camera.position.add(this.velocity);
      this.velocity.set(0, 0, 0); // 每帧重置速度，除非持续按键
    }
  }

  // 场景初始化
  function init(body: HTMLElement){
    if(isInit) return;
    isInit = true;
    initHelper();
    window.addEventListener("resize", handleResize);

    renderer.setSize(window.innerWidth, window.innerHeight);
    body.appendChild(renderer.domElement);
    body.appendChild(stats.dom);
    stats.dom.style.position = "absolute";

    camera.position.z = 5;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x3d3d3d);

    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    directionalLightHelper.update();
    scene.add(directionalLightHelper);

    scene.add(ambientLight);

    scene.add(axesHelper);

    scene.add(gridHelper);
    main();

    const helperTextElement = document.createElement("div");
    helperTextElement.innerHTML = `
      <p><b>W,A,S,D</b>: 上下左右</p>
      <p><b>空格</b>: 上升</p>
      <p><b>Shift</b>: 下降</p>
      <p><b>鼠标移动</b>: 视角控制</p>
    `
    helperTextElement.style.position = "absolute";
    helperTextElement.style.bottom = "10px";
    helperTextElement.style.left = "10px";
    helperTextElement.style.color = "#fff";
    helperTextElement.style.fontFamily = "Arial, sans-serif";
    helperTextElement.style.fontSize = "14px";
    body.appendChild(helperTextElement);
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
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function destory() {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }

    // control.dispose();

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
