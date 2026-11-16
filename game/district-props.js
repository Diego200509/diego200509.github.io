import * as THREE from "../vendor/three.module.min.js";
import { roomBox, rooms, supplyLocal } from "./interiors.js";
import { workshopPoint } from "./workshop.js";

export const seat = workshopPoint(-1.58, .33);
export const stand = workshopPoint(-1.58, -.45);
export const generator = workshopPoint(2.65, 4.6);

export function buildCampaignProps(scene, block, areas, interiors) {
  const steel = "#334850";
  const dark = "#1b2c32";
  const yellow = "#ebae66";
  const screen = new THREE.MeshBasicMaterial({ color: "#9cebd5" });
  const areaCover = Object.fromEntries(Object.keys(rooms).map(id => [id, []]));
  function solid(id, volume, color) {
    const [x, y, z, w, h, d] = volume;
    areaCover[id].push(roomBox(rooms[id], volume));
    return block(interiors[id], w, h, d, x, y, z, color);
  }

  for (const [id, room] of Object.entries(rooms)) {
    const [x, z] = room.console;
    const parent = interiors[id];
    const accent = { rgb: "#a9dfd0", talkapp: "#82b9da", traffic: "#f5cd7c", asotema: "#e9b887" }[id];
    const worktop = id === "traffic" ? 1.35 : 1.8;
    const light = new THREE.PointLight(accent, 15, 6.7, 2);
    light.position.set(0, 2.85, -.1);
    parent.add(light);
    block(parent, Math.min(2.7, room.width - .6), .08, .28, 0, 3.25, 0, screen, false);
    block(parent, Math.min(1.9, room.width - .78), .014, room.depth * .7, 0, .071, .22, "#716d61", false);
    solid(id, [x, .53, z - .06, worktop, 1.06, .62], steel);
    block(parent, worktop + .1, .11, .73, x, 1.015, z - .06, "#9b826b");
    const [w, h] = room.device === "pc" ? [.9, .53] : room.device === "tablet" ? [.74, .42] : [.31, .44];
    solid(id, [x, 1.28, z, w, h, .14], dark);
    block(parent, w - .085, h - .09, .029, x, 1.28, z + .081, screen, false);
    if (room.device === "pc") {
      block(parent, .65, .045, .19, x, 1.09, z + .21, dark, false);
      block(parent, .3, .64, .33, x + .67, .41, z -.15, dark);
    }
    if (id === "rgb") {
      for (const [index, color] of ["#e6605e", "#65c692", "#63a2e0"].entries()) {
        const shelf = .36 + index * .63;
        solid(id, [shelf, 1.33, -2.47, .47, 2.25, .35], steel);
        block(parent, .27, 1.82, .055, shelf, 1.39, -2.27, color, false);
      }
    } else if (id === "talkapp") {
      solid(id, [-2.55, 1.05, -1.91, .92, 2.1, .68], dark);
      for (let row = 0; row < 6; row++) {
        block(parent, .71, .13, .067, -2.55, .53 + row * .23, -1.54, steel);
        block(parent, .12, .045, .04, -2.31, .53 + row * .23, -1.49, screen, false);
      }
    } else if (id === "traffic") {
      block(parent, 1.27, .66, .08, 0, 2.05, -1.61, dark, false);
      for (const [i, color] of ["#dd735f", yellow, "#8fdeb6"].entries()) {
        block(parent, .17, .21, .06, -.33 + i * .33, 2.04, -1.55, color, false);
      }
    } else {
      solid(id, [-2.81, 1, -.3, .52, 2, 1.18], steel);
      for (let row = 0; row < 3; row++) {
        block(parent, .55, .08, 1.18, -2.82, .38 + row * .53, -.3, "#977f69");
        block(parent, .41, .23, .44, -2.82, .54 + row * .53, -.43, row === 1 ? yellow : "#8d9c92");
      }
    }
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
    areas.traffic.add(car);
    block(car, 1.85, .65, 1.22, 0, .47, 0, ["#ad634d", "#5d8b9a", "#aa965c"][index]);
    block(car, .98, .41, 1.02, -.12, .93, 0, "#233648");
    for (const z of [-.56, .56]) {
      for (const offset of [-.61, .59]) block(car, .34, .32, .18, offset, .22, z, dark);
    }
    return car;
  });

  const storage = new THREE.Group();
  const { x: depotX, z: depotZ } = supplyLocal;
  storage.position.set(depotX, 0, depotZ);
  interiors.asotema.add(storage);
  const gate = block(storage, 1.66, 1.65, .15, 0, .825, .78, steel);
  for (const dx of [-.86, .86]) solid("asotema", [depotX + dx, .825, depotZ - .12, .16, 1.65, 1.74], steel);
  const gateVolume = roomBox(rooms.asotema, [depotX, .825, depotZ + .78, 1.66, 1.65, .15]);
  const component = new THREE.Group();
  storage.add(component);
  block(component, .44, .24, .38, 0, .22, -.27, yellow);
  block(component, .33, .4, .35, 0, .25, .24, screen);
  const power = new THREE.MeshStandardMaterial({ color: "#91fbcc", emissive: "#6fffa8", emissiveIntensity: 0 });
  block(areas.return, 1.42, 1.04, .89, generator.x, .54, generator.z, steel);
  block(areas.return, .68, .33, .05, generator.x, .75, generator.z - .46, power);

  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(.18), new THREE.MeshBasicMaterial({ color: "#e9ce8b", fog: false }));
  scene.add(beacon);
  const points = [];
  return {
    cover,
    areaCover: { ...areaCover, return: [[generator.x, .54, generator.z, 1.42, 1.04, .89]] },
    gateVolume,
    get gateBlocked() { return gate.position.y + .825 > .15; },
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
    addWindow(parent, x, y, z, yaw, group) {
      const glow = new THREE.MeshBasicMaterial({ color: "#efcb8f", transparent: true, opacity: 0, depthWrite: false });
      block(parent, .8, .67, .033, x, y, z, glow, false).rotation.y = yaw;
      points.push({ glow, group });
    },
    lightWindows(restoration) {
      for (const { glow, group } of points) glow.opacity = THREE.MathUtils.clamp(restoration * 4.8 - group, 0, .9);
    }
  };
}
