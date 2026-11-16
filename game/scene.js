import * as THREE from "../vendor/three.module.min.js";
import { buildWorkshop, workshopPoint } from "./workshop.js";
import { buildCampaignProps } from "./district-props.js";
import { muralCells, muralPalette } from "./mural.js";

const LAND = "#d1ad83";
const CREAM = "#e9c8a0";
const CLAY = "#b86c51";
const INK = "#334858";
const WHITE = "#f4deba";
const WOOD = "#835139";
const PALETTE = muralPalette.map(color => `rgb(${color.join(",")})`);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const materials = new Map();

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

function radioAntenna(house) {
  const mastColor = "#344e5a";
  block(house, 1.1, 0.23, 0.9, 0, 4.36, 1, WHITE);
  block(house, 0.13, 1.58, 0.13, 0, 5.23, 1, mastColor);
  for (let level = 0; level < 3; level++) {
    block(house, 1.67 - level * 0.36, 0.085, 0.11, 0, 5.02 + level * 0.31, 1, mastColor);
  }
  block(house, 0.22, 0.17, 0.22, 0, 6.07, 1, "#a5e4d7");
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
  const pathStart = workshopPoint(0, 3.5);
  const pathEnd = { x: -2.8, z: 11.4 };
  const pathLength = Math.hypot(pathEnd.x - pathStart.x, pathEnd.z - pathStart.z);
  const path = block(scene, 2.75, .05, pathLength, (pathStart.x + pathEnd.x) / 2, .025, (pathStart.z + pathEnd.z) / 2, "#a08f83", false);
  path.rotation.y = Math.atan2(pathEnd.x - pathStart.x, pathEnd.z - pathStart.z);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const offset = (i - 3) * pathLength / 7;
      const x = path.position.x + Math.sin(path.rotation.y) * offset + Math.cos(path.rotation.y) * side * 1.21;
      const z = path.position.z + Math.cos(path.rotation.y) * offset - Math.sin(path.rotation.y) * side * 1.21;
      block(scene, .15, .09, .21, x, .066, z, "#ecd0a0", false).rotation.y = path.rotation.y;
    }
  }
  const plaza = new THREE.Mesh(new THREE.RingGeometry(2.95, 3.22, 48), new THREE.MeshStandardMaterial({ color: "#f0c18b", roughness: .91 }));
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, .046, 1.2);
  plaza.receiveShadow = true;
  scene.add(plaza);
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

  for (const [x, z, scale] of [[-7, -11, 1.1], [7, -12, 1.3], [-7.8, 9, 1.1], [13.6, 12.6, 1], [-14, -10, 1], [13, -9, 0.8], [-16.1, 16.7, 1.05], [4, 17, 0.86]]) {
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
  return [[-6.5, -6], [6.5, -6], [-7.3, 7], [-3.4, 13.6]].map(([x, z]) => {
    const lantern = new THREE.MeshStandardMaterial({ color: "#ffe5af", emissive: "#ffc276", emissiveIntensity: .74 });
    block(scene, 0.1, 2.75, 0.1, x, 1.38, z, INK);
    block(scene, 0.34, 0.18, 0.34, x, 2.73, z, INK);
    block(scene, 0.24, 0.25, 0.24, x, 2.57, z, lantern, false);
    const light = new THREE.PointLight("#ffc276", 0, 6.5, 2);
    light.position.set(x, 2.42, z);
    scene.add(light);
    return { lantern, light };
  });
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
  const mural = muralCells.map(({ col, row, band, shade }) =>
    ({ band, tile: block(house, .275, .244, .10, -3.85 + col * .29, .73 + row * .258, 3.01, `rgb(${shade},${shade},${shade})`, false) }));
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
  scene.fog = new THREE.Fog("#63758b", 8, 37);
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
        vec3 sunDir = normalize(vec3(-0.64, 0.24, -0.76));
        float alignment = max(0.0, dot(dir, sunDir));
        float glow = pow(alignment, 8.0);
        float sun = smoothstep(0.99926, 0.99965, alignment);
        gl_FragColor = vec4(mix(horizon, zenith, height) + vec3(0.29, 0.13, 0.045) * glow + sun * vec3(0.59, 0.41, 0.22), 1.0);
        #include <colorspace_fragment>
      }`
  }));
  skyDome.frustumCulled = false;
  scene.add(skyDome);
  const sky = new THREE.HemisphereLight("#adc9ff", "#716e82", 1.08);
  const sun = new THREE.DirectionalLight("#b7c7ff", .74);
  sun.position.set(-18, 15, -9);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 21, bottom: -21, near: 0.5, far: 63 });
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.045;
  scene.add(sky, sun);
  const haze = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: { strength: { value: .2 }, drift: { value: 0 } },
    vertexShader: "varying vec2 sheetUv; void main() { sheetUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec2 sheetUv; uniform float strength; uniform float drift;
      void main() {
        vec2 edge = vec2(1.0) - abs(sheetUv * 2.0 - 1.0);
        float fade = smoothstep(0.0, 0.42, edge.x) * smoothstep(0.0, 0.34, edge.y);
        float shape = sin(sheetUv.x * 29.0 + sin(sheetUv.y * 17.0 + drift) + drift) * 0.20 + 0.6;
        gl_FragColor = vec4(0.53, 0.63, 0.72, strength * fade * shape);
      }`
  });
  const hazeGeometry = new THREE.PlaneGeometry(24, 6);
  for (const [x, z, height] of [[-1, 3.2, .16], [3.1, -4.7, .23]]) {
    const layer = new THREE.Mesh(hazeGeometry, haze);
    layer.position.set(x, height, z);
    layer.rotation.x = -Math.PI / 2;
    scene.add(layer);
  }
  return { sky, sun, skyDome, haze };
}

export function buildDistrict(scene) {
  const lighting = sceneLighting(scene);
  const lanterns = terrain(scene);

  const rgbHouse = building(scene, 0, -11, 0, 9.5, "#ce906c", "#a96451", false);
  const association = building(scene, -14, 0, Math.PI / 2, 7.65, "#d4aa78", "#ad7251");
  const station = building(scene, 14, 0, -Math.PI / 2, 7.65, "#83a9a6", "#476876");
  roofTerrace(association);
  radioAntenna(station);
  const lab = makeLab(scene, rgbHouse);
  const traffic = crossing(scene);
  const workshop = buildWorkshop(scene, block, piece, sign);
  const props = buildCampaignProps(scene, block);
  for (const [id, x, z, yaw] of [[1, 11.04, 2.4, -Math.PI / 2], [2, -11.04, -2.4, Math.PI / 2], [3, 3.35, -8.02, 0]]) {
    props.addWindow(x, 1.97, z, yaw, id);
  }
  const signs = {
    rgb: sign(rgbHouse, 0, 3.12, 2.94, 3.8),
    asotema: sign(association, 0, 3.12, 2.94, 3.55),
    talkapp: sign(station, 0, 3.12, 2.94, 3.55),
    traffic: traffic.sign,
    ambacar: workshop.sign
  };
  let previous = {};
  return {
    lab,
    traffic,
    workshop,
    props, lighting, lanterns, material,
    setLabels(labels) {
      for (const [id, mesh] of Object.entries(signs)) {
        if (previous[id] === labels[id]) continue;
        mesh.material.map?.dispose();
        mesh.material.map = labelTexture(labels[id]);
        mesh.material.needsUpdate = true;
      }
      previous = labels;
    }
  };
}
