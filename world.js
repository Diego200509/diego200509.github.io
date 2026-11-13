import * as THREE from "./vendor/three.module.min.js";

const LAND = "#d1ad83";
const CREAM = "#e9c8a0";
const CLAY = "#b86c51";
const INK = "#334858";
const WHITE = "#f4deba";
const WOOD = "#835139";
const PALETTE = ["#f65351", "#60e893", "#64a0ff"];
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const EYE_HEIGHT = 1.68;
const RANGE = 4.6;
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const materials = new Map();

export const stops = {
  rgb: { x: 0, z: -3.3, yaw: -0.02 },
  asotema: { x: -10, z: 0, yaw: Math.PI / 2 },
  edurural: { x: 10, z: 0, yaw: -Math.PI / 2 },
  traffic: { x: 7.5, z: 11, yaw: 0 }
};

function material(color) {
  if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.83 }));
  return materials.get(color);
}

function block(parent, width, height, depth, x, y, z, color, shadow = true) {
  const mesh = new THREE.Mesh(boxGeometry, typeof color === "string" ? material(color) : color);
  mesh.scale.set(width, height, depth);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function piece(parent, geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(geometry, typeof color === "string" ? material(color) : color);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function building(scene, x, z, rotation, width, wall, roof, frontWindows = true) {
  const house = new THREE.Group();
  house.position.set(x, 0, z);
  house.rotation.y = rotation;
  scene.add(house);

  block(house, width + 0.48, 0.22, 6, 0, 0.11, 0, WOOD);
  block(house, width, 3.55, 5.45, 0, 1.94, 0, wall);
  block(house, width + 0.54, 0.22, 5.85, 0, 3.72, 0, WHITE);
  block(house, width + 0.42, 0.34, 5.7, 0, 3.96, 0, roof);
  block(house, width + 0.46, 0.12, 5.75, 0, 4.18, 0, WOOD);
  block(house, width, 0.18, 0.13, 0, 0.49, 2.76, CLAY);
  block(house, width, 0.12, 0.14, 0, 3.46, 2.78, WHITE);
  block(house, 1.9, 2.66, 0.18, 0, 1.53, 2.79, WHITE);
  block(house, 1.57, 2.36, 0.13, 0, 1.39, 2.9, INK);
  block(house, 0.7, 1.52, 0.07, -0.38, 1.51, 2.98, "#657a7c");
  block(house, 0.7, 1.52, 0.07, 0.38, 1.51, 2.98, "#657a7c");
  block(house, 2.18, 0.13, 0.6, 0, 0.12, 3.03, WHITE);
  block(house, 2.5, 0.09, 0.84, 0, 0.04, 3.22, CLAY);

  for (const side of [-1, 1]) {
    if (frontWindows) {
      const windowX = side * (width / 2 - 1.42);
      block(house, 1.6, 1.56, 0.15, windowX, 1.97, 2.76, WHITE);
      block(house, 1.41, 1.36, 0.12, windowX, 1.97, 2.85, INK);
      block(house, 1.21, 1.13, 0.07, windowX, 1.97, 2.92, "#708d99");
      block(house, 0.06, 1.2, 0.06, windowX, 1.97, 2.97, WHITE);
      block(house, 1.53, 0.12, 0.3, windowX, 1.21, 2.91, WOOD);
    }
    for (let i = 0; i < 3; i++) {
      block(house, 0.33, 0.1, 0.07, side * (width / 2 - 0.53 - i * 0.31), 3.12 - i * 0.13, 2.76, CLAY);
    }
  }

  for (const xSide of [-1, 1]) {
    for (const zSide of [-1, 1]) {
      block(house, 0.08, 1.33, 1.14, xSide * (width / 2 + 0.01), 2, zSide * 1.37, WHITE);
      block(house, 0.09, 1.12, 0.93, xSide * (width / 2 + 0.05), 2, zSide * 1.37, "#677f85");
    }
  }
  return house;
}

function roofTerrace(house) {
  block(house, 3.8, 0.16, 2.85, 0, 4.32, 0, CREAM);
  for (const x of [-1.62, 1.62]) {
    for (const z of [-1.15, 1.15]) block(house, 0.15, 1, 0.15, x, 4.87, z, WOOD);
    block(house, 0.13, 0.12, 2.46, x, 5.4, 0, WOOD);
  }
  for (let i = 0; i < 8; i++) block(house, 3.56, 0.12, 0.14, 0, 5.48, (i - 3.5) * 0.36, WOOD);
}

function schoolBell(house) {
  block(house, 1.2, 0.2, 0.85, 0, 4.35, 1.5, WHITE);
  for (const x of [-0.42, 0.42]) block(house, 0.19, 0.73, 0.37, x, 4.78, 1.5, WHITE);
  block(house, 1.21, 0.19, 0.85, 0, 5.21, 1.5, CLAY);
  piece(house, new THREE.CylinderGeometry(0.14, 0.29, 0.3, 12), "#bf8b4a", 0, 4.86, 1.55);
}

function labelTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#263c49";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#dbaa73";
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, 744, 136);
  ctx.fillStyle = "#fff0d6";
  ctx.font = "bold 69px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 384, 78, 700);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function sign(parent, x, y, z, width) {
  const back = new THREE.MeshBasicMaterial({ toneMapped: false });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4.8), back);
  plate.position.set(x, y, z);
  parent.add(plate);
  return plate;
}

function plant(scene, x, z, seed, scale = 1) {
  const pot = new THREE.Group();
  pot.position.set(x, 0, z);
  pot.scale.setScalar(scale);
  scene.add(pot);
  block(pot, 0.97, 0.4, 0.97, 0, 0.2, 0, CLAY);
  block(pot, 1.04, 0.1, 1.04, 0, 0.41, 0, WHITE);
  block(pot, 0.83, 0.03, 0.83, 0, 0.47, 0, "#755846");
  const leaf = new THREE.ConeGeometry(0.21, 0.91, 4);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + seed;
    const stem = piece(pot, leaf, i % 2 ? "#648365" : "#839357", Math.cos(angle) * 0.25, 0.81, Math.sin(angle) * 0.25);
    stem.quaternion.setFromUnitVectors(Y_AXIS, new THREE.Vector3(Math.cos(angle) * 0.8, 0.9, Math.sin(angle) * 0.8).normalize());
  }
}

function tree(scene, x, z, scale) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.scale.setScalar(scale);
  scene.add(group);
  piece(group, new THREE.CylinderGeometry(0.12, 0.26, 2.6, 7), WOOD, 0, 1.3, 0);
  const canopy = new THREE.IcosahedronGeometry(1, 1);
  for (const [dx, y, dz, s, color] of [
    [-0.6, 2.75, 0, 0.95, "#64754e"], [0.67, 2.75, -0.18, 0.89, "#879252"],
    [0.03, 3.38, 0, 1.14, "#9c9a57"], [0.1, 2.73, 0.56, 0.82, "#7e8852"]
  ]) piece(group, canopy, color, dx, y, dz).scale.setScalar(s);
}

function terrain(scene) {
  block(scene, 42, 0.28, 43, 0, -0.15, 0, LAND, false);
  const paving = new THREE.InstancedMesh(boxGeometry, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 }), 21 * 25);
  const matrix = new THREE.Matrix4();
  const colors = ["#b77858", "#ba805f", "#c38968", "#b57e60", "#c69270"];
  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 21; col++) {
      const index = row * 21 + col;
      const x = (col - 10) * 0.92 + (row % 2) * 0.41;
      const z = (row - 10) * 0.92;
      matrix.makeScale(0.892, 0.075, 0.892).setPosition(x, 0, z);
      paving.setMatrixAt(index, matrix);
      paving.setColorAt(index, new THREE.Color(colors[(row * 29 + col * 13 + row * col) % colors.length]));
    }
  }
  paving.receiveShadow = true;
  scene.add(paving);
  block(scene, 36, 0.84, 0.4, 0, 0.42, -16.2, CREAM);
  block(scene, 36, 0.13, 0.55, 0, 0.89, -16.2, CLAY);
  for (const x of [-18.2, 18.2]) {
    block(scene, 0.42, 0.74, 36, x, 0.37, 0.7, CREAM);
    block(scene, 0.56, 0.11, 36, x, 0.78, 0.7, CLAY);
  }

  for (const [level, distance, color] of [[0, 53, "#8196aa"], [1, 42, "#718897"]]) {
    const ridge = new THREE.Shape();
    ridge.moveTo(-57, -5);
    for (let x = -57; x <= 57; x += 1.5) {
      const height = 3 + Math.abs(Math.sin(x * 0.13 + level)) ** 1.4 * (5 - level) +
        Math.sin(x * 0.57 + level) * 0.78 + Math.sin(x * 0.89) * 0.48;
      ridge.lineTo(x, height);
    }
    ridge.lineTo(57, -5);
    ridge.closePath();
    for (let side = 0; side < 4; side++) {
      const mountain = new THREE.Mesh(new THREE.ShapeGeometry(ridge), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, toneMapped: false }));
      const angle = side * Math.PI / 2;
      mountain.rotation.y = angle;
      mountain.position.set(-Math.sin(angle) * distance, level * -1.1, -Math.cos(angle) * distance);
      scene.add(mountain);
    }
  }

  for (const [x, z, scale] of [[-7, -11, 1.1], [7, -12, 1.3], [-7.8, 9, 1.1], [13.6, 12.6, 1], [-14, -10, 1], [13, -9, 0.8], [-12, 13, 1.05], [4, 17, 0.86]]) {
    tree(scene, x, z, scale);
  }
  for (const [i, [x, z]] of [[-4.6, -7.5], [4.6, -7.5], [-10.3, -4.4], [-10.4, 4.4], [10.4, -4.4], [10.4, 4.4], [-4.8, 11.5], [1.1, 12.4], [-6, -5], [6, -5]].entries()) {
    plant(scene, x, z, i * 1.2, 0.8 + (i % 3) * 0.12);
  }
  for (const [x, z] of [[-5.3, 5], [-5.3, -3], [5.3, 5]]) {
    block(scene, 2.2, 0.15, 0.54, x, 0.52, z, WOOD);
    block(scene, 2.2, 0.29, 0.09, x, 0.78, z - 0.2, WOOD);
    for (const dx of [-0.76, 0.76]) block(scene, 0.18, 0.48, 0.46, x + dx, 0.25, z, CREAM);
  }
  for (const [x, z] of [[-6.5, -6], [6.5, -6], [-7.3, 7], [-3.4, 13.6]]) {
    block(scene, 0.1, 2.75, 0.1, x, 1.38, z, INK);
    block(scene, 0.34, 0.18, 0.34, x, 2.73, z, INK);
    block(scene, 0.24, 0.25, 0.24, x, 2.57, z, WHITE);
  }
}

function crossing(scene) {
  const colors = ["#ef6f5f", "#f5c96f", "#6bdfa2"];
  const lamps = colors.map(color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.18 }));
  block(scene, 9, 0.032, 4.6, 9, 0.032, 8.8, "#52616a", false);
  for (let i = 0; i < 6; i++) block(scene, 0.42, 0.015, 2.55, 6.6 + i * 0.52, 0.058, 8.8, WHITE, false);
  for (const [x, z] of [[10.4, 6.75], [5.4, 10.8]]) {
    block(scene, 0.11, 2.76, 0.11, x, 1.38, z, INK);
    block(scene, 0.46, 0.95, 0.28, x, 2.64, z, "#2a3c48");
    for (let i = 0; i < lamps.length; i++) {
      const light = piece(scene, new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12), lamps[i], x, 2.93 - i * 0.29, z + 0.16);
      light.rotation.x = Math.PI / 2;
    }
  }
  block(scene, 1.6, 0.17, 0.8, 7.5, 0.09, 11.45, CLAY);
  return { sign: sign(scene, 7.5, 1.2, 10.13, 2.65), lamps };
}

function makeLab(scene, house) {
  const mural = [];
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 6; row++) {
      const rise = Math.abs(Math.sin(col * 0.58 + 0.2)) * 2.7;
      const band = row < 1 + rise * 0.53 ? 1 : row < 2.4 + rise * 0.72 ? 0 : 2;
      const tile = block(house, 0.275, 0.244, 0.10, -3.85 + col * 0.29, 0.73 + row * 0.258, 3.01, row % 2 ? "#a99e91" : "#beb1a2", false);
      mural.push({ tile, band, gray: tile.material });
    }
  }
  const prisms = PALETTE.map((color, i) => {
    const x = 1.62 + i * 1.1;
    block(house, 0.82, 1.43, 0.25, x, 1.88, 3.01, INK);
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.57, metalness: 0.1, roughness: 0.24, flatShading: true });
    const crystal = piece(house, new THREE.OctahedronGeometry(0.49), mat, x, 1.94, 3.77);
    crystal.scale.set(0.76, 1.39, 0.66);
    crystal.castShadow = false;
    crystal.userData.prism = i;
    return crystal;
  });
  const light = new THREE.PointLight("#ffe1a8", 0, 11, 2);
  light.position.set(0, 2.8, -8.1);
  scene.add(light);
  return { mural, prisms, light };
}

function sceneLighting(scene) {
  scene.fog = new THREE.Fog("#d2c1b3", 24, 82);
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(89, 24, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      horizon: { value: new THREE.Color("#e6bf9b") },
      zenith: { value: new THREE.Color("#759ac1") }
    },
    vertexShader: "varying vec3 skyDirection; void main() { skyDirection = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform vec3 horizon; uniform vec3 zenith; varying vec3 skyDirection;
      void main() {
        vec3 dir = normalize(skyDirection);
        float height = smoothstep(-0.07, 0.48, dir.y);
        float glow = pow(max(0.0, dot(dir, normalize(vec3(-0.72, 0.2, 0.45)))), 8.0);
        gl_FragColor = vec4(mix(horizon, zenith, height) + vec3(0.18, 0.09, 0.03) * glow, 1.0);
        #include <colorspace_fragment>
      }`
  }));
  skyDome.frustumCulled = false;
  scene.add(skyDome);
  const sky = new THREE.HemisphereLight("#e3edff", "#8a6857", 1.95);
  const sun = new THREE.DirectionalLight("#ffd3a1", 2.5);
  sun.position.set(-12, 14, 10);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 21, bottom: -21, near: 0.5, far: 63 });
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  scene.add(sky, sun);
}

function positionAllowed(x, z) {
  const within = x > -17.55 && x < 17.55 && z > -15.7 && z < 17.5;
  const inLab = Math.abs(x) < 5.1 && z > -14.15 && z < -8;
  const sideWall = Math.abs(x) > 10.75 && Math.abs(x) < 16.8 && Math.abs(z) < 4.1;
  return within && !inLab && !sideWall;
}

export function createWorld(viewport, callbacks) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(67, 1, 0.08, 130);
  camera.rotation.order = "YXZ";
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  viewport.append(renderer.domElement);
  sceneLighting(scene);
  terrain(scene);

  const rgbHouse = building(scene, 0, -11, 0, 9.5, "#ce906c", "#a96451", false);
  const association = building(scene, -14, 0, Math.PI / 2, 7.65, "#d4aa78", "#ad7251");
  const school = building(scene, 14, 0, -Math.PI / 2, 7.65, "#a5a97a", "#6b8167");
  roofTerrace(association);
  schoolBell(school);
  const lab = makeLab(scene, rgbHouse);
  const traffic = crossing(scene);
  const signs = {
    rgb: sign(rgbHouse, 0, 3.12, 2.94, 3.8),
    asotema: sign(association, 0, 3.12, 2.94, 3.55),
    edurural: sign(school, 0, 3.12, 2.94, 3.55),
    traffic: traffic.sign
  };
  const ray = new THREE.Raycaster();
  const center = new THREE.Vector2();
  const keys = new Set();
  const motion = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const horizontal = new THREE.Vector3();
  const right = new THREE.Vector3();
  const target = new THREE.Vector3();
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pitch = -0.045;
  let yaw = 0;
  let pointer = null;
  let running = false;
  let paused = false;
  let last = 0;
  let targetKey = "";
  let activePrisms = new Set();

  function updateRotation() {
    camera.rotation.set(pitch, yaw, 0);
    camera.updateMatrixWorld();
  }

  function moveTo(id) {
    const point = stops[id];
    camera.position.set(point?.x ?? 0, EYE_HEIGHT, point?.z ?? 10.6);
    yaw = point?.yaw ?? 0;
    pitch = -0.045;
    if (!id) yaw = -0.055;
    updateRotation();
    reportTarget();
  }

  function closestStop() {
    let best = null;
    let distance = RANGE;
    for (const [id, point] of Object.entries(stops)) {
      const next = Math.hypot(camera.position.x - point.x, camera.position.z - point.z);
      if (next < distance) {
        best = id;
        distance = next;
      }
    }
    return best;
  }

  function aimedPrism() {
    ray.setFromCamera(center, camera);
    const hit = ray.intersectObjects(lab.prisms).find(({ object, distance }) => distance < 7.6 && !activePrisms.has(object.userData.prism));
    return hit?.object.userData.prism ?? null;
  }

  function reportTarget() {
    const stop = closestStop();
    const prism = stop === "rgb" ? aimedPrism() : null;
    const state = { stop, prism, restored: activePrisms.size === lab.prisms.length };
    const key = JSON.stringify(state);
    if (key === targetKey) return;
    targetKey = key;
    callbacks.onTarget(state);
  }

  function activate(index) {
    if (activePrisms.has(index)) return;
    activePrisms.add(index);
    callbacks.onPrism(index);
  }

  function interact() {
    if (!running || paused) return;
    const stop = closestStop();
    if (!stop) return;
    if (stop === "rgb" && activePrisms.size < lab.prisms.length) {
      const fallback = lab.prisms.findIndex((_, i) => !activePrisms.has(i));
      activate(aimedPrism() ?? fallback);
    } else {
      callbacks.onProject(stop);
    }
    reportTarget();
  }

  function resize() {
    if (!running) return;
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function updateMovement(dt) {
    const front = Number(keys.has("KeyW")) - Number(keys.has("KeyS"));
    const side = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
    if (!front && !side) return;
    camera.getWorldDirection(direction);
    horizontal.set(direction.x, 0, direction.z).normalize();
    right.crossVectors(horizontal, Y_AXIS);
    motion.copy(horizontal).multiplyScalar(front).addScaledVector(right, side).normalize().multiplyScalar(dt * 4.45);
    const pos = camera.position;
    if (positionAllowed(pos.x + motion.x, pos.z)) pos.x += motion.x;
    if (positionAllowed(pos.x, pos.z + motion.z)) pos.z += motion.z;
    camera.updateMatrixWorld();
  }

  function frame(time) {
    if (!running) return;
    const dt = Math.min((time - last) / 1000 || 0, 0.05);
    last = time;
    if (!paused) updateMovement(dt);
    for (const [i, crystal] of lab.prisms.entries()) {
      const active = activePrisms.has(i);
      target.set(crystal.position.x, active ? 1.9 : 1.96 + (reduceMotion ? 0 : Math.sin(time / 600 + i) * 0.12), active ? 3.22 : 3.77);
      crystal.position.lerp(target, reduceMotion ? 1 : Math.min(1, dt * 8));
      if (!reduceMotion) crystal.rotation.y += dt * (active ? 0.16 : 0.72);
      crystal.material.emissiveIntensity = active ? 0.9 : 0.55;
    }
    for (const { tile, band, gray } of lab.mural) tile.material = activePrisms.has(band) ? material(PALETTE[band]) : gray;
    lab.light.intensity = activePrisms.size === 3 ? 16 : 0;
    for (const [i, lamp] of traffic.lamps.entries()) lamp.emissiveIntensity = i === (reduceMotion ? 2 : [2, 2, 1, 0, 0][Math.floor(time / 1350) % 5]) ? 1.25 : 0.06;
    renderer.render(scene, camera);
    if (!paused) reportTarget();
  }

  viewport.addEventListener("pointerdown", (event) => {
    if (!running || paused || pointer || event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, motion: 0 };
  });
  viewport.addEventListener("pointermove", (event) => {
    if (pointer?.id !== event.pointerId || paused) return;
    const x = event.clientX - pointer.x;
    const y = event.clientY - pointer.y;
    pointer.motion += Math.abs(x) + Math.abs(y);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    yaw -= x * 0.004;
    pitch = THREE.MathUtils.clamp(pitch - y * 0.0037, -1.12, 1.12);
    updateRotation();
  });
  viewport.addEventListener("pointerup", (event) => {
    if (pointer?.id !== event.pointerId) return;
    const click = pointer.motion < 7;
    pointer = null;
    if (click && aimedPrism() !== null) interact();
  });
  viewport.addEventListener("lostpointercapture", () => { pointer = null; });
  window.addEventListener("resize", resize);

  return {
    start(saved) {
      activePrisms = new Set(saved);
      running = true;
      paused = false;
      last = performance.now();
      moveTo();
      resize();
      renderer.setAnimationLoop(frame);
    },
    stop() {
      running = false;
      keys.clear();
      pointer = null;
      renderer.setAnimationLoop(null);
    },
    pause(value) {
      paused = value;
      keys.clear();
      pointer = null;
    },
    setMove(code, held) {
      if (!running || paused) return;
      if (held) keys.add(code);
      else keys.delete(code);
    },
    look(amount) {
      if (!running || paused) return;
      yaw += amount;
      updateRotation();
    },
    interact,
    moveTo,
    setLabels(labels) {
      for (const [id, mesh] of Object.entries(signs)) {
        mesh.material.map?.dispose();
        mesh.material.map = labelTexture(labels[id]);
        mesh.material.needsUpdate = true;
      }
    }
  };
}
