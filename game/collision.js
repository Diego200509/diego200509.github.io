import * as THREE from "../vendor/three.module.min.js";
import { roomBox, rooms, roomWalls } from "./interiors.js";
import { workshopLocal, workshopPoint, workshopTerminal, workshopYaw } from "./workshop.js";

const bodyRadius = .25;
const bounds = { minX: -17.55, maxX: 17.55, minZ: -15.7, maxZ: 19.4 };
const axes = ["x", "z"];
const { x: roomX, z: roomZ } = workshopPoint(0, 0);
const roomOrigin = new THREE.Vector3(roomX, 0, roomZ);

function insideDistrict(x, z) {
  return x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ;
}

function overlapsSegment(box, from, to, radius) {
  let entry = 0;
  let exit = 1;
  for (const axis of axes) {
    const min = box.min[axis] - radius;
    const max = box.max[axis] + radius;
    const delta = to[axis] - from[axis];
    if (Math.abs(delta) < .00001) {
      if (from[axis] <= min || from[axis] >= max) return false;
      continue;
    }
    const a = (min - from[axis]) / delta;
    const b = (max - from[axis]) / delta;
    entry = Math.max(entry, Math.min(a, b));
    exit = Math.min(exit, Math.max(a, b));
    if (entry >= exit) return false;
  }
  return true;
}

export function createCollision() {
  const volumes = [];
  const ray = new THREE.Ray();
  const expanded = new THREE.Box3();
  const hit = new THREE.Vector3();
  const roomStart = new THREE.Vector3();
  const roomEnd = new THREE.Vector3();
  const local = new THREE.Vector3();
  const roomAxis = new THREE.Vector3(0, 1, 0);

  function add(x, y, z, width, height, depth, workshop = false) {
    const box = new THREE.Box3(
      new THREE.Vector3(x - width / 2, y - height / 2, z - depth / 2),
      new THREE.Vector3(x + width / 2, y + height / 2, z + depth / 2)
    );
    const volume = { box, workshop, active: true };
    volumes.push(volume);
    return volume;
  }

  add(0, -.16, 0, 44, .32, 44);
  add(0, .6, -16.2, 36, 1.2, .45);
  for (const x of [-18.2, 18.2]) add(x, .55, .7, .48, 1.1, 36);
  const areaVolumes = Object.fromEntries(Object.entries(rooms).map(([id, room]) =>
    [id, roomWalls(room).map(box => add(...roomBox(room, box)))]));
  areaVolumes.return = [];
  for (const x of [-3.7, 3.7]) add(x, 1.69, 0, .25, 3.38, 6, true);
  for (const x of [-2.6, 2.6]) add(x, 1.69, 2.87, 2.33, 3.38, .28, true);
  add(0, 1.69, -2.87, 7.62, 3.38, .3, true);
  add(0, 3.46, 0, 7.92, .23, 6.28, true);
  add(0, 3.03, 2.87, 3.04, .78, .3, true);
  add(1.75, .64, -1.54, 2.02, 1.28, .72, true);
  add(workshopTerminal.x, 1.38, -1.54, .78, .55, .15, true);
  add(-2.92, 1.025, -.32, .94, 2.05, 2.77, true);
  add(-1.58, .68, .86, 1.16, 1.35, .7, true);
  add(2.75, .9, 1.77, .56, 1.8, .68, true);
  for (const [x, z] of [[-5.3, 5], [-5.3, -3], [5.3, 5]]) add(x, .46, z, 2.2, .92, .54);
  const door = add(0, 1.34, 2.88, 2.82, 2.59, .12, true);

  return {
    add,
    bounds,
    door,
    areaVolumes,
    canStand(x, z, height, radius = bodyRadius) {
      if (!insideDistrict(x, z)) return false;
      const room = workshopLocal(x, z);
      return !volumes.some(({ box, workshop, active }) => {
        if (!active || box.max.y <= .035 || box.min.y >= height) return false;
        const px = workshop ? room.x : x;
        const pz = workshop ? room.z : z;
        return px > box.min.x - radius && px < box.max.x + radius &&
          pz > box.min.z - radius && pz < box.max.z + radius;
      });
    },
    canTraverse(from, to, height, radius) {
      if (!insideDistrict(to.x, to.z)) return false;
      const roomFrom = workshopLocal(from.x, from.z);
      const roomTo = workshopLocal(to.x, to.z);
      return !volumes.some(({ box, workshop, active }) => active && box.max.y > .035 && box.min.y < height &&
        overlapsSegment(box, workshop ? roomFrom : from, workshop ? roomTo : to, radius));
    },
    fraction(from, to, margin = 0) {
      const length = from.distanceTo(to);
      if (length < .00001) return 1;
      roomStart.copy(from).sub(roomOrigin).applyAxisAngle(roomAxis, -workshopYaw);
      roomEnd.copy(to).sub(roomOrigin).applyAxisAngle(roomAxis, -workshopYaw);
      let fraction = 1;
      for (const { box, workshop, active } of volumes) {
        if (!active) continue;
        const start = workshop ? roomStart : from;
        const end = workshop ? roomEnd : to;
        ray.set(start, local.subVectors(end, start).divideScalar(length));
        expanded.copy(box).expandByScalar(margin);
        if (expanded.containsPoint(start)) return 0;
        if (ray.intersectBox(expanded, hit)) fraction = Math.min(fraction, Math.max(0, (start.distanceTo(hit) - .02) / length));
      }
      return fraction;
    }
  };
}
