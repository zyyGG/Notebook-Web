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
  const control = new OrbitControls(camera, renderer.domElement);

  /**
   * 总结：
   * 这里使用的是菲涅尔效应来实现边缘高亮
   * 通过计算视线方向和法线的点积来确定边缘位置
   * 使用幂函数来控制边缘的锐度
   * 通过后期处理将边缘效果叠加到原始渲染上
   * 优点：
   *  实现简单，效果还不错
   * 缺点：
   *  只能内发光，无法实现外发光
   *  对于有多个uv的模型，边缘效果会不连续(具体看示例中的矩形)
   *  对于复杂模型，边缘效果可能不均匀
   *  边缘不能设置成黑色
   */

  // 核心函数写在这里
  function main() {
    gridHelper.visible = false;
    axesHelper.visible = false;
    directionalLightHelper.visible = false;
    control.enablePan = false;

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: null },
          uRimColor: { value: new THREE.Color(0xff0000) },
          uRimWidth: { value: 2.5 },
          uRimStrength: { value: 3.0 },
        },
        vertexShader: /* glsl */`
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            
            vUv = uv;
            vNormal = normalMatrix * normal;
            vViewDir = -mvPosition.xyz;
          }
        `,
        fragmentShader: /* glsl */`
          uniform sampler2D tDiffuse;
          uniform vec3 uRimColor;
          uniform float uRimWidth;
          uniform float uRimStrength;

          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vViewDir;

          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewDir);


            vec3 color = vec3(1.0);
            float rim = 1.0 - max(dot(viewDir, normal), 0.0);
            rim = pow(rim, uRimWidth) * uRimStrength; // 使用幂函数控制边缘的锐度
            color = mix(vec3(0.0, 0.0, 0.0), uRimColor, rim); // 混合颜色
            gl_FragColor = vec4(color, 1.0); // 下面的色彩混合是相加，所以纯黑色默认当成了透明
          }
        `,
        transparent: true,

      })
    )
    scene.add(sphere);

    // 正常方块
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      sphere.material
    );
    cube.position.set(2, 0, 0);
    scene.add(cube)

    // 扭结
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16),
      sphere.material
    );
    torusKnot.position.set(-2, 0, 0);
    scene.add(torusKnot);


    const rimFolder = gui.addFolder("Rim Effect");
    rimFolder.add((sphere.material as THREE.ShaderMaterial).uniforms.uRimColor.value, "r", 0, 1).name("Rim Color R");
    rimFolder.add((sphere.material as THREE.ShaderMaterial).uniforms.uRimColor.value, "g", 0, 1).name("Rim Color G");
    rimFolder.add((sphere.material as THREE.ShaderMaterial).uniforms.uRimColor.value, "b", 0, 1).name("Rim Color B");
    rimFolder.add((sphere.material as THREE.ShaderMaterial).uniforms.uRimWidth, "value", 0.1, 10).name("Rim Width");
    rimFolder.add((sphere.material as THREE.ShaderMaterial).uniforms.uRimStrength, "value", 0.1, 10).name("Rim Strength");
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
    body.appendChild(stats.dom);
    stats.dom.style.position = "absolute";

    camera.position.z = 5;
    camera.position.y = 5;
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
