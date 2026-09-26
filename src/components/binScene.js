import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export function createBinScene(host, { onReady, onError, onMouth }) {
  let disposed = false;
  let frame = 0;
  let startedAt = null;
  let playing = false;
  let reduced = false;
  let lid;
  let root;
  let environment;
  const closed = new THREE.Quaternion();
  let opened = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, -1, 0).normalize(),
    THREE.MathUtils.degToRad(65),
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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9ba8b4, 0.7));
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
  const gradient = ctx.createRadialGradient(64, 64, 12, 64, 64, 64);
  gradient.addColorStop(0, "rgba(24, 30, 27, 0.23)");
  gradient.addColorStop(1, "rgba(24, 30, 27, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.7),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(shadowCanvas),
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
    const halfHeight = width < 640 ? 0.64 : 0.6;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.left = (-halfHeight * width) / height;
    camera.right = -camera.left;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (root) {
      scene.updateMatrixWorld(true);
      const mouth = root
        .localToWorld(new THREE.Vector3(0, 0, 0.6))
        .project(camera);
      onMouth({ x: (mouth.x + 1) / 2, y: (1 - mouth.y) / 2 });
    }
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function tick(now) {
    frame = 0;
    if (disposed || !lid) return;
    const elapsed = startedAt === null ? 0 : (now - startedAt) / 1000;
    const t = reduced ? 1 : THREE.MathUtils.clamp((elapsed - 2) / 0.5, 0, 1);
    const eased = t * t * (3 - 2 * t);
    lid.quaternion.copy(opened).slerp(closed, eased);
    host.dataset.lidAngle = String((1 - eased) * 65);
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
    "/assets/3d/bin.glb",
    (gltf) => {
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }
      try {
        root = gltf.scene;
        const body = root.getObjectByName("bin_body");
        lid = root.getObjectByName("bin_lid");
        if (!body || !lid)
          throw new Error("The bin model needs separate body and lid meshes.");
        const optionalGround = root.getObjectByName("ground_plane_optional");
        if (optionalGround) {
          optionalGround.removeFromParent();
          disposeObject(optionalGround);
        }
        root.traverse((child) => {
          if (child.isMesh) {
            child.geometry.computeVertexNormals();
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        // This supplied Z-up GLB stores hinge-relative lid vertices, but omits its node translation and material.
        // Remove the supplied cylinder's top disk so waste can enter the actual opening.
        const positions = body.geometry.attributes.position;
        const indices = body.geometry.index.array;
        const openIndices = [];
        for (let i = 0; i < indices.length; i += 3) {
          const triangle = [indices[i], indices[i + 1], indices[i + 2]];
          if (!triangle.every((index) => positions.getZ(index) > 0.599))
            openIndices.push(...triangle);
        }
        body.geometry.setIndex(openIndices);
        body.geometry.computeVertexNormals();
        body.material.side = THREE.DoubleSide;
        lid.geometry.computeBoundingBox();
        body.geometry.computeBoundingBox();
        const lidCenter = lid.geometry.boundingBox.getCenter(
          new THREE.Vector3(),
        );
        lid.position.set(
          -lidCenter.x,
          -lidCenter.y,
          body.geometry.boundingBox.max.z,
        );
        lid.material.dispose();
        lid.material = body.material.clone();
        const rotationTrack = gltf.animations[0]?.tracks.find((track) =>
          track.name.endsWith(".quaternion"),
        );
        if (rotationTrack)
          opened.fromArray(
            rotationTrack.values,
            rotationTrack.values.length - 4,
          );
        root.rotation.set(-Math.PI / 2, 0, 0);
        root.rotateZ(-Math.PI / 2);
        scene.add(root);
        host.dataset.model = "bin.glb";
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
      observer.disconnect();
      disposeObject(scene);
      environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
