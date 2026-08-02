import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";

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

    camera.position.set(0, 20, 40);
    // camera.lookAt(0, 40, 0);

    // 配置场景
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(90, 0.1, 90),
      new THREE.MeshStandardMaterial({
        color: "#888888",
        metalness: 0.1,
        roughness: 0.5,
      })
    )
    scene.add(floor)

    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 10, 0.1),
      floor.material
    )
    wall.position.set(10, 5, -20)
    scene.add(wall)

    const playerMaterial = new THREE.MeshStandardMaterial({ 
      color: "#ff8855",
      metalness: 0.1,
      roughness: 0.84
    })
    const shineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D( tDiffuse, vUv );
          gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
        }
      `,
    })

    const player = new THREE.Mesh(
      // 胶囊
      new THREE.CapsuleGeometry(1, 2, 32, 32),
      playerMaterial,
    )
    player.position.set(0, 2, -25)
    scene.add(player)
    
    // 设置摄像层级
    const DEFAULT_LAYER = 0; // 默认层级
    const DEPTH_LAYER = 1; // 深度贴图层级


    // 加载深度贴图
    const parent = renderer.domElement.parentElement!;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const depthTarget = new THREE.WebGLRenderTarget(width, height) // 深度贴图的渲染目标
    depthTarget.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedShortType); // 创建深度纹理

    const playerTarget = new THREE.WebGLRenderTarget(width, height) // 玩家贴图的渲染目标
    playerTarget.depthTexture = new THREE.DepthTexture(width, height, THREE.UnsignedShortType); // 创建深度纹理

    const playerShineTarget = new THREE.WebGLRenderTarget(width, height) // 玩家贴图的渲染目标



    // 后处理
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const composerMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uDepthTexture: { value: depthTarget.depthTexture },
        uPlayerTexture: { value: playerTarget.depthTexture },
        uPlayerOutlineTexture: { value: playerShineTarget.texture },
        uCameraNear: { value: camera.near },
        uCameraFar: { value: camera.far },
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform sampler2D uDepthTexture;
        uniform sampler2D uPlayerTexture;
        uniform sampler2D uPlayerOutlineTexture;
        uniform float uTime;
        uniform float uCameraNear;
        uniform float uCameraFar;

        varying vec2 vUv;

        // 线性化深度值, 把0-1转回坐标空间的深度值，最终结果是far（1000）到near（0.1）
        float linearizeDepth(float depth) {
          float z = depth * 2.0 - 1.0; // back to NDC
          return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
        }

        void main() {
          vec4 color = texture2D( tDiffuse, vUv );
          float depth = linearizeDepth(texture2D(uDepthTexture, vUv).r);
          float playerDepth = linearizeDepth(texture2D(uPlayerTexture, vUv).r);
          vec4 playerOutlineColor = texture2D(uPlayerOutlineTexture, vUv);

          // 如果 playerDepth 接近远平面，说明该像素没有玩家，直接显示场景颜色
          if (playerDepth >= uCameraFar - 0.001) {
            gl_FragColor = color;
          } else if (depth < playerDepth) {
            // 墙体在玩家前面，显示玩家轮廓（透视效果）
            gl_FragColor = playerOutlineColor;
          } else {
            // 玩家在墙体前面或深度相等，显示场景颜色
            gl_FragColor = color;
          }
        }
      `
    })
    const shaderPass = new ShaderPass(composerMaterial)
    const ouputPass = new OutputPass() // 这个是为了输出正确的色彩

    // 混合通道
    composer.addPass(renderPass);
    composer.addPass(shaderPass);
    composer.addPass(ouputPass);
    



    update = () => {
      const delta = timer.getDelta();

      // 渲染场景深度
      // scene.overrideMaterial = new THREE.MeshDepthMaterial();
      // 把模型提升到深度采样中
      wall.layers.set(DEPTH_LAYER);
      // floor.layers.set(DEPTH_LAYER);
      player.layers.set(DEPTH_LAYER);
      camera.layers.set(DEPTH_LAYER);

      wall.visible = true;
      // floor.visible = true;
      player.visible = false;
      renderer.setRenderTarget(depthTarget);
      renderer.render(scene, camera);

      wall.visible = false;
      // floor.visible = false;
      player.visible = true;
      renderer.setRenderTarget(playerTarget);
      renderer.render(scene, camera);

      // scene.overrideMaterial = null;

      // @ts-ignore
      player.material = shineMaterial;
      renderer.setRenderTarget(playerShineTarget);
      renderer.render(scene, camera);
      player.material = playerMaterial;
      
      wall.layers.set(DEFAULT_LAYER);
      // floor.layers.set(DEFAULT_LAYER);
      player.layers.set(DEFAULT_LAYER);
      camera.layers.set(DEFAULT_LAYER);

      wall.visible = true;
      // floor.visible = true;
      player.visible = true;
      renderer.setRenderTarget(null);
      composer.render();
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
    camera.aspect = width / height;
    camera.position.z = 5;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
    scene.background = new THREE.Color(0x999999);
    renderer.setClearColor(new THREE.Color(0xffffff), 0.0); // 设置背景透明

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
  function render(timestamp: number = 0) {
    update();
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
