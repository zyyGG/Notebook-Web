import * as THREE from "three";
import { GUI } from "dat.gui";
import Stats from 'three/addons/libs/stats.module.js'; // 性能监视工具
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { HDRLoader } from "three/examples/jsm/Addons.js";

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

  // 创建传送门效果的mesh
  class TeleportMesh extends THREE.Mesh {
    width: number;
    height: number;
    constructor(width: number = 1, height: number = 2, options: THREE.MeshBasicMaterialParameters = {}) {
      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0.0 },
          uMap: { value: null },
          uParallax: { value: 0.4 },
          uExposure: { value: 0.8 },
          uBorderColor: { value: new THREE.Color(0.47, 0.47, 0.47) },
          uBorderWidth: { value: 0.2 },
          uBorderAlpha: { value: 0.8 },
          uBorderSampleCount: { value: 16 },
          uSize: { value: 0.5 },
        },
        vertexShader: /* glsl */`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          varying vec3 vWorldNormal;

          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);

            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */`
          uniform sampler2D uMap;
          uniform float uParallax;
          uniform float uExposure;
          uniform float uTime;
          uniform vec3 uBorderColor;
          uniform float uBorderWidth;
          uniform float uBorderAlpha;
          uniform float uBorderSampleCount;
          uniform float uSize;

          varying vec2 vUv;
          varying vec3 vWorldPos;
          varying vec3 vWorldNormal;

          const float PI = 3.141592653589793;

          vec2 dirToEquirectUV(vec3 dir) {
            dir = normalize(dir);
            float u = atan(dir.z, dir.x) / (2.0 * PI) + 0.5;
            float v = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5;
            return vec2(u, v);
          }

          float sdf_circle(vec2 uv, float radius) {
            return length(uv - vec2(0.5)) - radius;
          }

          vec2 random_v2(vec2 st) {
            st = vec2( dot(st, vec2(127.1, 311.7)),
                        dot(st, vec2(269.5, 183.3)) );
            return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
          }

          float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(dot(random_v2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                            dot(random_v2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                        mix(dot(random_v2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                            dot(random_v2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
          }

          void main() {
            vec3 V = normalize(cameraPosition - vWorldPos);   // 每像素视线方向
            vec3 N = normalize(vWorldNormal)  + noise(vUv * 16.0 + uTime) * 0.01; // 法线加噪，增加细节

            // 反射方向 + 视角强度控制，产生明显空间感
            vec3 R = normalize(reflect(-V, N * uParallax)) + V * uParallax * 0.5;
            vec2 envUV = dirToEquirectUV(R);

            vec3 envColor = texture2D(uMap, envUV).rgb * uExposure;

            float border_noise = noise(vec2(vUv * uBorderSampleCount + uTime)) * 0.5 + 0.5;

            // 传送门效果
            float circle_1 = sdf_circle(vUv, uSize) + border_noise * 0.05;
            vec3 color = envColor;
            color = mix(uBorderColor, color, step(0.0, circle_1));
            color = mix(envColor, color , smoothstep(-uBorderWidth, 1.0 - uBorderAlpha, circle_1)); // 使用smoothstep实现平滑边缘过渡
            float alpha = 1.0 - step(0.0, circle_1);

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
      })
      super(geometry, material);
      this.width = width;
      this.height = height;
    }
  }

  let update = () => {}


  // 核心函数写在这里
  async function main() {
    axesHelper.visible = false;
    gridHelper.visible = false;
    directionalLightHelper.visible = false;

    camera.position.set(0, -5, 10);
    // camera.lookAt(0, 20, 0);


    const hdrLoader = new HDRLoader ()
    const envMap  = await hdrLoader.loadAsync("/default/public/hdr/kloofendal_48d_partly_cloudy_puresky_1k.hdr")
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    // 构件基础场景
    const groups = new THREE.Group();
    scene.add(groups);
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(50, 0.1, 50),
      new THREE.MeshStandardMaterial({ color: 0x808080 })
    )
    // groups.add(floor)
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(50, 10, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x808080 })
    )
    wall.position.set(0, 5, -2)
    groups.add(wall)

    const teleportMesh = new TeleportMesh(3.5, 5, envMap)
    scene.add(teleportMesh)
    teleportMesh.position.set(0, 3, -1.9)
    const material = teleportMesh.material as THREE.ShaderMaterial
    material.uniforms.uMap.value = envMap
    camera.lookAt(teleportMesh.position)

    const parlaxFolder = gui.addFolder('细节调整')
    parlaxFolder.open
    parlaxFolder.add(material.uniforms.uParallax, 'value', 0.0, 1.0).name('视差强度')
    parlaxFolder.add(material.uniforms.uExposure, 'value', 0.0, 2.0).name('曝光强度')
    parlaxFolder.add(material.uniforms.uBorderWidth, 'value', 0.0, 0.5).name('边缘宽度')
    parlaxFolder.add(material.uniforms.uBorderAlpha, 'value', 0.0, 1.0).name('边缘透明度')
    parlaxFolder.add(material.uniforms.uSize, 'value', 0.1, 1.0).name('传送门大小')
    parlaxFolder.add(material.uniforms.uBorderSampleCount, 'value', 1.0, 64.0).name('边缘噪声采样数').step(1)
    parlaxFolder.addColor({ color: '#808080' }, 'color').name('边缘颜色').onChange(value => {
      material.uniforms.uBorderColor.value.set(value);
    })

    // 初始化GUI

    update = () => {
      // 增加时间，传送门的shader会根据时间变化产生动态效果
      const material = (teleportMesh.material as THREE.ShaderMaterial)
      material.uniforms.uTime.value += 0.01;
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
    control.update();

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
    renderer.render(scene, camera);
    stats.update();
    control.update();
    requestId = requestAnimationFrame(render);
    update();
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
