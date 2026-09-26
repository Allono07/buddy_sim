import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function createBinScene(host, { onReady, onError, onMouth }) {
  let disposed = false;
  let frame = 0;
  let startedAt = null;
  let playing = false;
  let reduced = false;
  let lidPivot;
  let root;
  let environment;
  const openAngle = 32;
  const closed = new THREE.Quaternion();
  const opened = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    THREE.MathUtils.degToRad(-openAngle),
  );
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 0.52, -0.52, 0.01, 20);
  camera.position.set(0.65, 1.05, 2.3);
  camera.lookAt(0, 0.42, 0);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9ba8b4, 0.7);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfffaf1, 1.8);
  key.position.set(-1.5, 2.5, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -1;
  key.shadow.camera.right = key.shadow.camera.top = 1;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.015;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe6f0ff, 0.8);
  fill.position.set(2, 1, -1);
  scene.add(fill);
  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext("2d");
  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  function paintGroundShadow(dark) {
    ctx.clearRect(0, 0, 128, 128);
    const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    gradient.addColorStop(
      0,
      dark ? "rgba(8, 10, 8, 0.5)" : "rgba(24, 30, 27, 0.36)",
    );
    gradient.addColorStop(
      0.62,
      dark ? "rgba(8, 10, 8, 0.22)" : "rgba(24, 30, 27, 0.14)",
    );
    gradient.addColorStop(1, "rgba(24, 30, 27, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    shadowTexture.needsUpdate = true;
  }
  const darkTheme = () => document.documentElement.dataset.theme === "dark";
  function updateThemeLighting() {
    const dark = darkTheme();
    hemi.color.set(dark ? 0xd0d1c8 : 0xffffff);
    hemi.groundColor.set(dark ? 0x55574e : 0x9ba8b4);
    hemi.intensity = dark ? 0.48 : 0.7;
    key.color.set(dark ? 0xffffff : 0xfffaf1);
    key.intensity = dark ? 2.15 : 1.8;
    fill.color.set(dark ? 0xb8c1b1 : 0xe6f0ff);
    fill.intensity = dark ? 0.28 : 0.8;
    scene.environmentIntensity = dark ? 0.72 : 1;
    paintGroundShadow(dark);
    render();
  }
  const themeObserver = new MutationObserver(updateThemeLighting);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  updateThemeLighting();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1.3, 0.95),
    new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.005;
  floor.receiveShadow = true;
  scene.add(floor);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();

  function render() {
    if (!disposed) renderer.render(scene, camera);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height || disposed) return;
    const halfHeight = 0.72;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = (-halfHeight * width) / height;
    camera.right = -camera.left;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (root) {
      const modelScale = width < 640 ? 0.66 : 0.76;
      root.scale.setScalar(modelScale);
      root.position.y = -0.08 * modelScale;
      scene.updateMatrixWorld(true);
      const mouth = root
        .localToWorld(new THREE.Vector3(0, 0, 0.99))
        .project(camera);
      onMouth({ x: (mouth.x + 1) / 2, y: (1 - mouth.y) / 2 });
    }
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function tick(now) {
    frame = 0;
    if (disposed || !lidPivot) return;
    const elapsed = startedAt === null ? 0 : (now - startedAt) / 1000;
    const t = reduced ? 1 : THREE.MathUtils.clamp((elapsed - 2) / 0.5, 0, 1);
    const eased = t * t * (3 - 2 * t);
    lidPivot.quaternion.copy(opened).slerp(closed, eased);
    host.dataset.lidAngle = String((1 - eased) * openAngle);
    render();
    if (playing && !reduced && elapsed < 2.5)
      frame = requestAnimationFrame(tick);
  }
  function setPlayback(started, prefersReducedMotion) {
    reduced = prefersReducedMotion;
    if (started && !playing) startedAt = performance.now();
    playing = started;
    cancelAnimationFrame(frame);
    tick(performance.now());
  }
  function disposeObject(object) {
    object.traverse((child) => {
      child.geometry?.dispose();
      const materials = child.material
        ? Array.isArray(child.material)
          ? child.material
          : [child.material]
        : [];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value?.isTexture) value.dispose();
        });
        material.dispose();
      });
    });
  }
  new GLTFLoader().load(
    "/assets/dustbinpackage/trashbuddy_wheelie_bin.glb",
    (gltf) => {
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }
      try {
        root = gltf.scene;
        const body = root.getObjectByName("Bin_Body");
        const lid = root.getObjectByName("Lid");
        const greenDetail = root.getObjectByName("Lower_Foot_Lip")?.material;
        if (!body || !lid)
          throw new Error("The wheelie-bin model needs separate body and lid meshes.");
        root.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeVertexNormals();
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // The model is Z-up; remove only the body's flat top cap to leave the bin mouth open.
        const positions = body.geometry.attributes.position;
        const indices = body.geometry.index.array;
        const openIndices = [];
        body.geometry.computeBoundingBox();
        const top = body.geometry.boundingBox.max.z;
        for (let i = 0; i < indices.length; i += 3) {
          const triangle = [indices[i], indices[i + 1], indices[i + 2]];
          if (!triangle.every((index) => positions.getZ(index) >= top - 1e-4))
            openIndices.push(...triangle);
        }
        body.geometry.setIndex(openIndices);
        body.geometry.computeVertexNormals();
        if (greenDetail) {
          body.material = greenDetail.clone();
          lid.material = greenDetail.clone();
          body.material.color.set(0x0b681d);
          lid.material.color.set(0x0b681d);
          body.material.side = THREE.DoubleSide;
          lid.material.side = THREE.DoubleSide;
        }

        // Parent the lid to the model's rear hinge so it closes flush and rotates smoothly.
        const hinge = new THREE.Vector3(0, 0.339, 0.985);
        lidPivot = new THREE.Group();
        lidPivot.name = "bin_lid_pivot";
        lidPivot.position.copy(hinge);
        root.add(lidPivot);
        lid.position.sub(hinge);
        lidPivot.add(lid);

        // The package uses a temporary municipal decal. Repair the nearly-transparent
        // exported material while preserving the decal's embedded alpha texture.
        const decal = root.getObjectByName(
          "TrashBuddy_Logo_DECAL__REFERENCE_MARK",
        );
        const decalMaterial = Array.isArray(decal?.material)
          ? decal.material[0]
          : decal?.material;
        if (decal && decalMaterial?.map) {
          decalMaterial.map.colorSpace = THREE.SRGBColorSpace;
          decalMaterial.color.set(0xffffff);
          decalMaterial.opacity = 1;
          decalMaterial.transparent = true;
          decalMaterial.alphaTest = 0.04;
          decalMaterial.depthWrite = false;
          decalMaterial.side = THREE.DoubleSide;
          decalMaterial.needsUpdate = true;
        }

        root.rotation.set(-Math.PI / 2, 0, 0);
        scene.add(root);
        updateThemeLighting();
        host.dataset.model = "trashbuddy_wheelie_bin.glb";
        resize();
        tick(performance.now());
        onReady();
      } catch (error) {
        onError(error);
      }
    },
    undefined,
    onError,
  );
  resize();
  return {
    setPlayback,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      observer.disconnect();
      disposeObject(scene);
      environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
