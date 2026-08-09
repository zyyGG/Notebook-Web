import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

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

  
  function main(body: HTMLElement) {
    // 隐藏部分效果
    gridHelper.visible = false;
    directionalLightHelper.visible = false;
    

    // 创建半球光
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(hemisphereLight);
    camera.position.set(0, 10, 10)

    // 实例化对象组
    const instanceGroup = new THREE.Group();
    scene.add(instanceGroup);

    // 初始化实例化对象
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide })
    );
    scene.add(floor);
    floor.rotation.x = -Math.PI / 2
    floor.position.y -= 0.01

    // 
    const maxInstanceCount = 10000; // 最大实例个数
    let activeInstanceCount = 0; // 当前激活的实例个数
    const instanceGeometry = new THREE.BoxGeometry(1, 1, 1);
    const instanceMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const instanceMesh = new THREE.InstancedMesh(instanceGeometry, instanceMaterial, maxInstanceCount);
    instanceMesh.count = 0; // 一开始没有方块
    instanceMesh.frustumCulled = false; // 禁用视锥体剔除，确保所有实例都被渲染
    instanceGroup.add(instanceMesh);

    // 射线管理
    // 用于射线检测的临时向量
    const mouse = new THREE.Vector2()
    const tempColor = new THREE.Color()

    // 创建点击射线
    const raycaster = new THREE.Raycaster()
    const mouseStart = new THREE.Vector2()
    const mouseEnd = new THREE.Vector2()

    // 方块指示器
    const indicatorGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01))
    const indicatorMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
    const indicatorMesh = new THREE.LineSegments(indicatorGeometry, indicatorMaterial)
    indicatorMesh.visible = false
    scene.add(indicatorMesh)

    // 地面指示器
    const floorIndicatorGeometry = new THREE.PlaneGeometry(0.9, 0.9)
    const floorIndicatorMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
    const floorIndicatorMesh = new THREE.Mesh(floorIndicatorGeometry, floorIndicatorMaterial)
    floorIndicatorMesh.rotation.x = -Math.PI / 2
    floorIndicatorMesh.visible = false
    scene.add(floorIndicatorMesh)


    body.addEventListener("mousedown", (event) => {
      console.log()
      mouseStart.set(event.layerX, event.layerY)
    })

    body.addEventListener("mouseup", event => {
      mouseEnd.set(event.layerX, event.layerY)
      if(mouseStart.distanceTo(mouseEnd) > 5) return

      if(event.button === 2) handleRightClick(event)
      else if(event.button === 0) handleLeftClick(event)
    })

    body.addEventListener("mousemove", (event) => {
      const width = renderer.domElement.clientWidth
      const height = renderer.domElement.clientHeight
      mouse.x = (event.layerX / width) * 2 - 1
      mouse.y = -(event.layerY / height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const instanceIntersect = raycaster.intersectObject(instanceMesh)
      if (instanceIntersect.length > 0) {
        const hit = instanceIntersect[0]
        const index = hit.instanceId
        const tempMatrix = new THREE.Matrix4()
        instanceMesh.getMatrixAt(index!, tempMatrix)
        const position = new THREE.Vector3()
        position.setFromMatrixPosition(tempMatrix)
        gsap.to(indicatorMesh.position, {
          x: position.x,
          y: position.y,
          z: position.z,
          duration: 0.1
        })
        // indicatorMesh.position.copy(position)
        indicatorMesh.visible = true
        floorIndicatorMesh.visible = false
        return
        // console.log(`鼠标悬停在实例 #${index} 上，位置: (${position.x}, ${position.y}, ${position.z})`)
      } 

      const floorIntersect = raycaster.intersectObject(floor)
      if (floorIntersect.length > 0) {
        const point = floorIntersect[0].point
        gsap.to(floorIndicatorMesh.position, {
          x: Math.round(point.x),
          y: 0.01,
          z: Math.round(point.z),
          duration: 0.1
        })
        floorIndicatorMesh.visible = true
        indicatorMesh.visible = false
        return
      }

    })

    // 处理左键点击事件
    function handleLeftClick(event: MouseEvent) {
      const width = renderer.domElement.clientWidth
      const height = renderer.domElement.clientHeight
      mouse.x = (event.layerX / width) * 2 - 1
      mouse.y = -(event.layerY / height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      // 先检测是否点击到已有实例
      const instanceIntersect = raycaster.intersectObject(instanceMesh)
      if (instanceIntersect.length > 0) {
        const hit = instanceIntersect[0]
        const normal = hit.face!.normal.clone()
        const cx = hit.point.x + normal.x * 0.5
        const cy = hit.point.y + normal.y * 0.5
        const cz = hit.point.z + normal.z * 0.5
        addInstance(
          Math.round(cx),
          Math.round(cy - 0.5) + 0.5, // 方块中心在 y=0.5
          Math.round(cz)
        ) // 点击到已有实例 → 在该位置添加新实例
        return
      }

      // 没点到实例，再检测地面 → 添加新实例
      const floorIntersect = raycaster.intersectObject(floor)
      if (floorIntersect.length > 0) {
        const x = Math.round(floorIntersect[0].point.x)
        const y = 0.5
        const z = Math.round(floorIntersect[0].point.z)
        addInstance(x, y, z)
        return
      }
    }

    // 处理右键点击事件
    function handleRightClick(event: MouseEvent) {
      const width = renderer.domElement.clientWidth
      const height = renderer.domElement.clientHeight
      mouse.x = (event.layerX / width) * 2 - 1
      mouse.y = -(event.layerY / height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const instanceIntersect = raycaster.intersectObject(instanceMesh)
      if (instanceIntersect.length > 0) {
        const hit = instanceIntersect[0]
        const index = hit.instanceId
        removeInstance(index!)
      }
    }

    // 添加方块实例
    function addInstance(x: number, y: number, z: number) {
      if (activeInstanceCount >= maxInstanceCount) {
        console.warn('实例数量已达上限')
        return
      }
      activeInstanceCount++
      instanceMesh.count = activeInstanceCount

      const dummy = new THREE.Object3D()
      dummy.position.copy(new THREE.Vector3(x, y, z)) // 方块中心在 y=0.5
      // dummy.rotation.y = Math.random() * Math.PI * 2
      dummy.updateMatrix()
      instanceMesh.setMatrixAt(activeInstanceCount - 1, dummy.matrix)
      instanceMesh.instanceMatrix.needsUpdate = true
      instanceMesh.computeBoundingSphere()
      // instanceMesh.computeBoundingBox()

      // console.log(`添加实例 #${activeInstanceCount - 1}`)
    }

    function addInstanceAtInstance(position: THREE.Vector3, face: any) {
      const offset = face.normal.clone().multiplyScalar(1) // 沿法线方向偏移一个单位
      addInstance(position.clone().add(offset).x, position.clone().add(offset).y, position.clone().add(offset).z)
    }

    function removeInstance(index: number) {
      // 这里采用移位法, 删除的方块直接删, 后面的方块往前移动, 保持id顺序

      if(index < 0 || index >= activeInstanceCount) return 

      for(let i = index; i < activeInstanceCount - 1; i++) {
        const tempMatrix = new THREE.Matrix4()
        instanceMesh.getMatrixAt(i + 1, tempMatrix)
        instanceMesh.setMatrixAt(i, tempMatrix)
      }
      activeInstanceCount--
      instanceMesh.count = activeInstanceCount
      instanceMesh.instanceMatrix.needsUpdate = true
      instanceMesh.computeBoundingSphere() // 重新计算包围球
    }

    // 规整坐标位置
    function processPosition(position: THREE.Vector3): THREE.Vector3 {
      return new THREE.Vector3(
        Math.round(position.x),
        Math.round(position.y),
        Math.round(position.z)
      )
    }


    update = () => {
      const delta = timer.getDelta();
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
    main(body);

    const helperTextElement = document.createElement("div");
    helperTextElement.innerHTML = `
      <p><b>左键放置, 右键删除<b></p>
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
  function render(timestamp: number = 0) {
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
