import * as THREE from "../vendor/three.module.min.js";
import { workshopPoint } from "./workshop.js";

export const seat = workshopPoint(-1.58, .33);
export const stand = workshopPoint(-1.58, -.45);
export const generator = workshopPoint(2.65, 4.6);
export const supply = { x: -9.52, z: 2.65 };
export const consoles = {
  rgb: { x: -3.15, z: -7.28, yaw: 0 },
  traffic: { x: 7.5, z: 10.62, yaw: 0 },
  asotema: { x: -10.25, z: -.9, yaw: Math.PI / 2 }
};

export function buildCampaignProps(scene, block) {
  const steel = "#334850";
  const dark = "#1b2c32";
  const yellow = "#ebae66";
  const screen = new THREE.MeshStandardMaterial({ color: "#75ddc1", emissive: "#38c3a0", emissiveIntensity: 1.2 });
  for (const [id, { x, z, yaw }] of Object.entries(consoles)) {
    const terminal = new THREE.Group();
    terminal.position.set(x, 0, z);
    terminal.rotation.y = yaw;
    scene.add(terminal);
    block(terminal, 1.06, 1.04, .47, 0, .52, 0, steel);
    block(terminal, .95, .53, .12, 0, 1.28, -.03, dark);
    block(terminal, .82, .38, .027, 0, 1.28, .049, screen, false);
    block(terminal, .76, .032, .2, 0, 1.06, .12, id === "traffic" ? yellow : dark, false);
  }
  const cover = [
    [-3.5, .57, 7.3, 2.4, 1.14, .54],
    [3.5, .53, 2.85, 1.75, 1.06, .72],
    [8.55, .54, 4.75, .52, 1.08, 2.1],
    [-6.2, .63, 10.6, 1.32, 1.26, .8],
    [2.4, .55, 14, 1.55, 1.1, .7],
    [-4, .51, -4.25, 2.25, 1.02, .55]
  ];
  for (const [x, y, z, width, height, depth] of cover) {
    block(scene, width, height, depth, x, y, z, steel);
    block(scene, width + .04, .08, depth + .04, x, y + height / 2, z, yellow);
  }
  // A crossbeam forms a shorter route behind the cover.
  block(scene, 1.65, .2, .46, -3.5, 1.49, 5.9, steel);
  for (const x of [-4.39, -2.61]) {
    block(scene, .16, 1.59, .46, x, .8, 5.9, steel);
    cover.push([x, .8, 5.9, .16, 1.59, .46]);
  }
  cover.push([-3.5, 1.49, 5.9, 1.65, .2, .46]);

  const cars = [6.6, 8.7, 10.8].map((x, index) => {
    const car = new THREE.Group();
    car.position.set(x, 0, 8.78);
    scene.add(car);
    block(car, 1.85, .65, 1.22, 0, .47, 0, ["#ad634d", "#5d8b9a", "#aa965c"][index]);
    block(car, .98, .41, 1.02, -.12, .93, 0, "#233648");
    for (const z of [-.56, .56]) {
      for (const offset of [-.61, .59]) block(car, .34, .32, .18, offset, .22, z, dark);
    }
    return car;
  });

  const storage = new THREE.Group();
  storage.position.set(supply.x, 0, supply.z);
  scene.add(storage);
  const gate = block(storage, .22, 1.65, 1.7, .62, .825, 0, steel);
  for (const z of [-.84, .84]) {
    block(storage, 1.45, 1.65, .16, 0, .825, z, steel);
    cover.push([supply.x, .825, supply.z + z, 1.45, 1.65, .16]);
  }
  const component = new THREE.Group();
  storage.add(component);
  block(component, .44, .24, .38, 0, .22, -.27, yellow);
  block(component, .33, .4, .35, 0, .25, .24, screen);
  const power = new THREE.MeshStandardMaterial({ color: "#91fbcc", emissive: "#6fffa8", emissiveIntensity: 0 });
  block(scene, 1.42, 1.04, .89, generator.x, .54, generator.z, steel);
  block(scene, .68, .33, .05, generator.x, .75, generator.z - .46, power);
  cover.push([generator.x, .54, generator.z, 1.42, 1.04, .89]);

  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(.18), new THREE.MeshBasicMaterial({ color: "#e9ce8b" }));
  scene.add(beacon);
  const points = [];
  return {
    cover,
    cars,
    beacon,
    update(dt, time, campaign, reduced) {
      gate.position.y = reduced ? (campaign.done("expense") ? -.85 : .825) :
        THREE.MathUtils.damp(gate.position.y, campaign.done("expense") ? -.85 : .825, 8, dt);
      gate.visible = gate.position.y > -.8;
      component.visible = !campaign.done("supply");
      power.emissiveIntensity = campaign.done("power") ? 2 : 0;
      for (const [i, car] of cars.entries()) {
        const start = 6.6 + i * 2.1;
        const end = campaign.done("traffic") ? 22 + i * 2.1 : start;
        car.position.x = reduced ? end : THREE.MathUtils.damp(car.position.x, end, 1.6, dt);
        car.visible = car.position.x < 19;
      }
      if (!reduced) beacon.rotation.y = time * 1.5;
    },
    addWindow(x, y, z, yaw, group) {
      const glow = new THREE.MeshBasicMaterial({ color: "#efcb8f", transparent: true, opacity: 0, depthWrite: false });
      block(scene, .8, .67, .033, x, y, z, glow, false).rotation.y = yaw;
      points.push({ glow, group });
    },
    lightWindows(restoration) {
      for (const { glow, group } of points) glow.opacity = THREE.MathUtils.clamp(restoration * 4.8 - group, 0, .9);
    }
  };
}
