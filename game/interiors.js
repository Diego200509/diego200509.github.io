export const rooms = {
  rgb: { x: 0, z: -11, yaw: 0, width: 9.5, depth: 5.45, console: [-1.5, -1.5], device: "pc" },
  talkapp: { x: 14, z: 0, yaw: -Math.PI / 2, width: 7.65, depth: 5.45, console: [0, -1.42], device: "phone" },
  traffic: { x: 7.5, z: 14.1, yaw: Math.PI, width: 4.45, depth: 3.6, console: [0, -1], device: "tablet" },
  asotema: { x: -14, z: 0, yaw: Math.PI / 2, width: 7.65, depth: 5.45, console: [-1.48, -1.46], device: "pc" }
};

export const doorwayWidth = 1.8;
const wallThickness = .24;
const wallHeight = 3.36;

export function roomPoint(room, x, z) {
  const sin = Math.sin(room.yaw);
  const cos = Math.cos(room.yaw);
  return { x: room.x + x * cos + z * sin, z: room.z - x * sin + z * cos, yaw: room.yaw };
}

export function roomContains(room, position) {
  const dx = position.x - room.x;
  const dz = position.z - room.z;
  const sin = Math.sin(room.yaw);
  const cos = Math.cos(room.yaw);
  return Math.abs(dx * cos - dz * sin) < room.width / 2 - wallThickness &&
    Math.abs(dx * sin + dz * cos) < room.depth / 2 - wallThickness / 2;
}

export function roomBox(room, [x, y, z, width, height, depth]) {
  const point = roomPoint(room, x, z);
  const sideways = Math.abs(Math.sin(room.yaw)) > .5;
  return [point.x, y, point.z, sideways ? depth : width, height, sideways ? width : depth];
}

export function roomWalls({ width, depth }) {
  const halfDepth = depth / 2;
  const frontWidth = (width - doorwayWidth) / 2;
  const frontOffset = doorwayWidth / 2 + frontWidth / 2;
  return [
    ...[-1, 1].map(side => [side * (width - wallThickness) / 2, wallHeight / 2, 0, wallThickness, wallHeight, depth]),
    ...[-1, 1].map(side => [side * frontOffset, wallHeight / 2, halfDepth, frontWidth, wallHeight, wallThickness]),
    [0, wallHeight / 2, -halfDepth, width, wallHeight, wallThickness],
    [0, 2.84, halfDepth, doorwayWidth, 1.04, wallThickness],
    [0, 3.46, 0, width + .24, .22, depth + .32]
  ];
}

export const entrances = Object.fromEntries(Object.entries(rooms).map(([id, room]) =>
  [id, roomPoint(room, 0, room.depth / 2 + .22)]));

export const consoles = Object.fromEntries(Object.entries(rooms).map(([id, room]) =>
  [id, roomPoint(room, ...room.console)]));

export const supplyLocal = { x: 2.21, z: -1.7 };
export const supply = roomPoint(rooms.asotema, supplyLocal.x, supplyLocal.z);
