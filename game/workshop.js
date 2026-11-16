import * as THREE from "../vendor/three.module.min.js";

const X = -11;
const Z = 13.6;
const C = Math.SQRT1_2;
export const workshopYaw = Math.PI / 4;
export const workshopTerminal = { x: 1.58, z: -1.22 };

export function workshopLocal(x, z) {
  return { x: (x - X) * C - (z - Z) * C, z: (x - X) * C + (z - Z) * C };
}

export function workshopPoint(x, z) {
  return { x: X + (x + z) * C, z: Z + (z - x) * C };
}

function createMonitor() {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 234;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  let last;

  return {
    material: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
    update(completed) {
      if (last === completed) return;
      last = completed;
      context.fillStyle = "#263134";
      context.fillRect(0, 0, 384, 234);
      context.fillStyle = "#364347";
      context.fillRect(0, 0, 384, 30);
      context.fillStyle = "#647878";
      context.fillRect(58, 9, 296, 12);
      context.fillStyle = "#f0d2a8";
      context.font = "bold 46px sans-serif";
      context.fillText("ZEUS", 25, 90);
      context.fillStyle = "#445456";
      context.fillRect(24, 110, 334, 90);
      context.fillStyle = completed ? "#addaaf" : "#e1b781";
      context.fillRect(42, 130, 32, 32);
      context.fillStyle = "#b0beb8";
      context.fillRect(90, 134, 201, 8);
      context.fillStyle = "#819592";
      context.fillRect(90, 153, 140, 7);
      context.fillRect(43, 179, 277, 5);
      texture.needsUpdate = true;
    }
  };
}

export function buildWorkshop(scene, block, piece, sign) {
  const room = new THREE.Group();
  room.position.set(X, 0, Z);
  room.rotation.y = workshopYaw;
  scene.add(room);

  const plaster = "#b9c4b6";
  const steel = "#344750";
  const wood = "#83583f";
  block(room, 7.6, .12, 6.1, 0, -.013, 0, "#9c8877");
  for (const side of [-1, 1]) {
    block(room, .25, 3.38, 6, side * 3.7, 1.69, 0, plaster);
    block(room, 2.33, 3.38, .28, side * 2.6, 1.69, 2.87, plaster);
    block(room, .18, .18, 5.52, side * 3.52, 3.15, 0, steel);
    block(room, 1.54, .87, .08, side * 2.59, 1.87, 3.04, steel);
    block(room, 1.31, .67, .07, side * 2.59, 1.87, 3.09, "#7fadb3");
    block(room, .06, .67, .09, side * 2.59, 1.87, 3.13, plaster);
  }
  block(room, 7.62, 3.38, .3, 0, 1.69, -2.87, plaster);
  block(room, 7.92, .23, 6.28, 0, 3.46, 0, "#435d68");
  block(room, 7.96, .16, .36, 0, 3.61, 3.01, "#d39b62");
  block(room, 3.04, .78, .3, 0, 3.03, 2.87, steel);
  block(room, 3.06, .12, .54, 0, 2.65, 3.02, "#d39b62");
  const portal = sign(room, 0, 3.03, 3.08, 2.95);
  const door = new THREE.Group();
  door.position.set(0, 1.34, 2.88);
  room.add(door);
  block(door, 2.82, 2.59, .12, 0, 0, 0, steel, false);
  for (let i = 0; i < 7; i++) block(door, 2.74, .027, .04, 0, -1.12 + i * .37, .082, "#6d8085", false);
  block(room, 3.16, .05, .65, 0, .055, 3.18, "#d39b62");
  const welcome = new THREE.MeshBasicMaterial({ color: "#dfa459", toneMapped: false });
  block(room, 2.96, .035, .13, 0, 2.574, 3.13, welcome, false);
  const signalMaterial = new THREE.MeshStandardMaterial({ color: "#dfa459", emissive: "#dfa459", emissiveIntensity: .3 });
  for (const side of [-1, 1]) block(room, .12, .12, .24, side * 1.62, 2.65, 3.17, signalMaterial, false);

  // Workbench, shelves, and terminal sit clear of the walkable aisle.
  const benchZ = -1.54;
  block(room, 2.02, .12, .72, 1.75, .96, benchZ, wood);
  for (const x of [0.85, 2.65]) block(room, .12, .94, .61, x, .48, benchZ, steel);
  block(room, .78, .55, .15, workshopTerminal.x, 1.38, benchZ, steel);
  const monitor = createMonitor();
  monitor.update(false);
  block(room, .70, .43, .018, workshopTerminal.x, 1.40, benchZ + .087, monitor.material, false);
  block(room, .10, .16, .08, workshopTerminal.x, 1.09, benchZ, steel);
  block(room, .33, .033, .23, workshopTerminal.x, 1.038, benchZ, steel);
  block(room, .51, .026, .16, workshopTerminal.x, 1.033, benchZ + .25, "#2b383b", false);
  for (let row = 0; row < 3; row++) {
    for (let key = 0; key < 10; key++) {
      block(room, .037, .012, .029, workshopTerminal.x - .207 + key * .046, 1.049, benchZ + .204 + row * .043, "#647472", false);
    }
  }
  piece(room, new THREE.SphereGeometry(1, 9, 5), new THREE.MeshStandardMaterial({ color: "#2b383b", roughness: .75 }), workshopTerminal.x + .39, 1.034, benchZ + .24).scale.set(.057, .026, .076);
  block(room, .85, 2.05, 2.65, -2.92, 1.025, -.32, steel);
  for (let i = 0; i < 3; i++) {
    block(room, .94, .08, 2.77, -2.86, .48 + i * .58, -.32, wood);
    for (const z of [-1.25, -.42, .53]) {
      block(room, .78, .28, .58, -2.77, .66 + i * .58, z, i === 1 ? "#a97755" : "#698080");
    }
  }
  block(room, 1.16, .29, .84, -1.58, .39, .67, wood);
  block(room, 1.15, .17, .85, -1.58, .61, .61, "#856d5f");
  block(room, 1.17, .82, .23, -1.58, .92, 1.02, "#856d5f");
  for (const x of [-2.11, -1.05]) block(room, .16, .36, .83, x, .72, .67, wood);
  block(room, .58, 1.79, .64, 2.75, .895, 1.77, steel);
  const lockerDoor = block(room, .52, 1.71, .06, 2.75, .9, 2.11, "#58717a");
  block(room, .08, .125, .08, 2.9, .99, 2.16, "#e1b781", false);
  const stripe = new THREE.MeshBasicMaterial({ color: "#ffc989" });
  block(room, 4.2, .055, .14, 0, 3.29, -.65, stripe, false);
  block(room, 5.96, .28, .05, 0, .17, -2.68, steel, false);
  block(room, 1.52, .98, .05, -.72, 1.93, -2.68, "#778d8a", false);
  for (let row = 0; row < 3; row++) {
    block(room, .92 - row * .12, .032, .026, -.77, 2.11 - row * .19, -2.637, "#cce1d7", false);
  }
  for (const x of [-1.35, -.48, .39]) {
    block(room, .075, .018, 2.1, x, .059, .23, "#d2b98e", false);
  }
  const light = new THREE.PointLight("#ffcd90", 28, 9, 2);
  light.position.set(0, 2.88, -.52);
  room.add(light);
  const marker = piece(room, new THREE.OctahedronGeometry(.12), new THREE.MeshBasicMaterial({ color: "#a4ffe0" }), workshopTerminal.x, 1.92, benchZ);
  marker.castShadow = false;
  let doorPosition = 0;

  return {
    sign: portal,
    get doorBottom() { return 2.635 - Math.max(.03, 1 - doorPosition) * 2.59; },
    get doorVisible() { return door.visible; },
    update(dt, time, open, completed, reduced) {
      doorPosition = reduced ? Number(open) : THREE.MathUtils.damp(doorPosition, Number(open), 9, dt);
      door.scale.y = Math.max(.03, 1 - doorPosition);
      door.position.y = 2.635 - door.scale.y * 1.295;
      door.visible = doorPosition < .97;
      lockerDoor.position.y = reduced ? (completed ? 1.62 : .9) :
        THREE.MathUtils.damp(lockerDoor.position.y, completed ? 1.62 : .9, 8, dt);
      signalMaterial.color.set(completed ? "#a6f1bb" : "#dfa459");
      signalMaterial.emissive.copy(signalMaterial.color);
      signalMaterial.emissiveIntensity = completed ? 2.2 : .35;
      portal.material.color.set(completed ? "#bdffd3" : "#ffffff");
      welcome.color.set(completed ? "#a6f1bb" : "#dfa459");
      monitor.update(completed);
      marker.visible = !completed;
      if (!reduced) {
        marker.position.y = 1.92 + Math.sin(time / 480) * .08;
        marker.rotation.y += dt * 1.6;
      }
    }
  };
}
