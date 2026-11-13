import * as THREE from "../vendor/three.module.min.js";
import { createAvatar } from "./avatar.js";
import { createPlayerCamera } from "./camera.js";
import { buildDistrict } from "./scene.js";

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const RANGE = 4.6;

const stops = {
  rgb: { x: 0, z: -3.3, yaw: -0.02 },
  asotema: { x: -10, z: 0, yaw: Math.PI / 2 },
  edurural: { x: 10, z: 0, yaw: -Math.PI / 2 },
  traffic: { x: 7.5, z: 11, yaw: 0 },
  ambacar: { x: -7.4, z: 16.8, yaw: Math.PI / 4 }
};

function positionAllowed(x, z) {
  const within = x > -17.55 && x < 17.55 && z > -15.7 && z < 19.4;
  const inLab = Math.abs(x) < 5.1 && z > -14.15 && z < -8;
  const sideWall = Math.abs(x) > 10.75 && Math.abs(x) < 16.8 && Math.abs(z) < 4.1;
  const garageX = (x + 11) * Math.SQRT1_2 - (z - 13.6) * Math.SQRT1_2;
  const garageZ = (x + 11) * Math.SQRT1_2 + (z - 13.6) * Math.SQRT1_2;
  const inGarage = Math.abs(garageX) < 4.06 && Math.abs(garageZ) < 3.12;
  return within && !inLab && !sideWall && !inGarage;
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
  const { lab, traffic, color, setLabels } = buildDistrict(scene);
  const player = createPlayerCamera(camera, positionAllowed);
  const avatar = createAvatar(scene);
  viewport.append(renderer.domElement);
  const ray = new THREE.Raycaster();
  const center = new THREE.Vector2();
  const keys = new Set();
  const motion = new THREE.Vector3();
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
  let preparing;

  function updateRotation() {
    player.update(yaw, pitch);
    avatar.body.position.copy(player.position);
    avatar.body.rotation.y = yaw;
    avatar.body.visible = player.thirdPerson && camera.position.distanceTo(player.position) > 2.15;
  }

  function moveTo(id) {
    const point = stops[id];
    player.position.set(point?.x ?? 0, 0, point?.z ?? 10.6);
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
      const next = Math.hypot(player.position.x - point.x, player.position.z - point.z);
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
    if (!front && !side) return false;
    horizontal.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.crossVectors(horizontal, Y_AXIS);
    motion.copy(horizontal).multiplyScalar(front).addScaledVector(right, side).normalize().multiplyScalar(dt * 4.45);
    const pos = player.position;
    const x = pos.x;
    const z = pos.z;
    if (positionAllowed(pos.x + motion.x, pos.z)) pos.x += motion.x;
    if (positionAllowed(pos.x, pos.z + motion.z)) pos.z += motion.z;
    if (x === pos.x && z === pos.z) return false;
    updateRotation();
    return true;
  }

  function frame(time) {
    if (!running) return;
    const dt = Math.min((time - last) / 1000 || 0, 0.05);
    last = time;
    const moving = !paused && updateMovement(dt);
    if (player.thirdPerson) avatar.update(dt, moving, reduceMotion);
    for (const [i, crystal] of lab.prisms.entries()) {
      const active = activePrisms.has(i);
      target.set(crystal.position.x, active ? 1.9 : 1.96 + (reduceMotion ? 0 : Math.sin(time / 600 + i) * 0.12), active ? 3.22 : 3.77);
      crystal.position.lerp(target, reduceMotion ? 1 : Math.min(1, dt * 8));
      if (!reduceMotion) crystal.rotation.y += dt * (active ? 0.16 : 0.72);
      crystal.material.emissiveIntensity = active ? 0.9 : 0.55;
    }
    for (const { tile, band, gray } of lab.mural) tile.material = activePrisms.has(band) ? color(band) : gray;
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

  function toggleCamera() {
    if (!running || paused) return;
    const thirdPerson = player.toggle();
    updateRotation();
    callbacks.onCamera(thirdPerson);
    reportTarget();
  }

  return {
    prepare() {
      preparing ??= renderer.compileAsync(scene, camera).catch((error) => {
        preparing = undefined;
        throw error;
      });
      return preparing;
    },
    toggleCamera,
    start(saved) {
      activePrisms = new Set(saved);
      running = true;
      paused = false;
      last = performance.now();
      moveTo();
      resize();
      frame(last);
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
    setLabels
  };
}
