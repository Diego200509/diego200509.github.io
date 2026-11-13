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

export function workshopClear(x, z, open) {
  if (Math.abs(x) >= 3.95 || Math.abs(z) >= 3.15) return true;
  if (z >= 2.36) return open && Math.abs(x) < 1.25;
  if (Math.abs(x) > 3.38 || z < -2.33) return false;
  return !(z < -0.89 && x > 0.79 && x < 2.8) && !(x < -2.28 && z < 1.62);
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
  const screen = new THREE.MeshStandardMaterial({ color: "#86e9ce", emissive: "#61dabc", emissiveIntensity: .88 });
  block(room, .64, .39, .035, workshopTerminal.x, 1.39, benchZ + .09, screen, false);
  block(room, .28, .09, .21, workshopTerminal.x, 1.07, benchZ, steel);
  block(room, .53, .038, .18, workshopTerminal.x, 1.04, benchZ + .27, steel);
  for (let i = 0; i < 4; i++) {
    block(room, .24 + i * .043, .014, .026, workshopTerminal.x - .07, 1.49 - i * .06, benchZ + .112, "#e9fff5", false);
  }
  block(room, .85, 2.05, 2.65, -2.92, 1.025, -.32, steel);
  for (let i = 0; i < 3; i++) {
    block(room, .94, .08, 2.77, -2.86, .48 + i * .58, -.32, wood);
    for (const z of [-1.25, -.42, .53]) {
      block(room, .78, .28, .58, -2.77, .66 + i * .58, z, i === 1 ? "#a97755" : "#698080");
    }
  }
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
    update(dt, time, open, completed, reduced) {
      doorPosition = reduced ? Number(open) : THREE.MathUtils.damp(doorPosition, Number(open), 9, dt);
      door.scale.y = Math.max(.03, 1 - doorPosition);
      door.position.y = 2.635 - door.scale.y * 1.295;
      door.visible = doorPosition < .97;
      signalMaterial.color.set(completed ? "#a6f1bb" : "#dfa459");
      signalMaterial.emissive.copy(signalMaterial.color);
      signalMaterial.emissiveIntensity = completed ? 2.2 : .35;
      portal.material.color.set(completed ? "#bdffd3" : "#ffffff");
      welcome.color.set(completed ? "#a6f1bb" : "#dfa459");
      screen.emissiveIntensity = completed ? 1.55 : .88;
      marker.visible = !completed;
      if (!reduced) {
        marker.position.y = 1.92 + Math.sin(time / 480) * .08;
        marker.rotation.y += dt * 1.6;
      }
    }
  };
}
