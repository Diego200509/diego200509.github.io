const spacing = .72;
const adjacent = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
const distance = (from, to) => Math.hypot(from.x - to.x, from.z - to.z);

export function createRobotNavigation(collision) {
  const { minX, maxX, minZ, maxZ } = collision.bounds;
  const columns = Math.floor((maxX - minX) / spacing);
  const rows = Math.floor((maxZ - minZ) / spacing);
  const offsetX = minX + spacing / 2;
  const offsetZ = minZ + spacing / 2;
  const cells = Array.from({ length: columns * rows }, (_, index) => ({
    x: offsetX + (index % columns) * spacing,
    z: offsetZ + Math.floor(index / columns) * spacing
  }));

  function nearestCell(point, accept) {
    const column = Math.max(0, Math.min(columns - 1, Math.round((point.x - offsetX) / spacing)));
    const row = Math.max(0, Math.min(rows - 1, Math.round((point.z - offsetZ) / spacing)));
    let closest = -1;
    let best = Infinity;
    for (let z = Math.max(0, row - 3); z <= Math.min(rows - 1, row + 3); z++) {
      for (let x = Math.max(0, column - 3); x <= Math.min(columns - 1, column + 3); x++) {
        const id = z * columns + x;
        const gap = distance(cells[id], point);
        if (gap >= best || !accept(id)) continue;
        best = gap;
        closest = id;
      }
    }
    return closest;
  }

  return {
    findPath(from, to, height, radius) {
      const target = { x: to.x, z: to.z };
      const clear = (a, b) => collision.canTraverse(a, b, height, radius);
      if (clear(from, target)) return [target];

      const standable = new Uint8Array(cells.length);
      function walkable(id) {
        if (!standable[id]) {
          const { x, z } = cells[id];
          standable[id] = collision.canStand(x, z, height, radius) ? 1 : 2;
        }
        return standable[id] === 1;
      }

      const start = nearestCell(from, id => walkable(id) && clear(from, cells[id]));
      const exactTarget = collision.canStand(target.x, target.z, height, radius);
      const goal = nearestCell(target, id => walkable(id) && (!exactTarget || clear(cells[id], target)));
      if (start < 0 || goal < 0) return [];

      const cost = new Float64Array(cells.length).fill(Infinity);
      const previous = new Int32Array(cells.length).fill(-1);
      const state = new Uint8Array(cells.length);
      const pending = [start];
      cost[start] = 0;
      state[start] = 1;
      let closest = start;
      let closestDistance = distance(cells[start], target);

      while (pending.length) {
        let pick = 0;
        let score = Infinity;
        for (let index = 0; index < pending.length; index++) {
          const id = pending[index];
          const estimate = cost[id] + distance(cells[id], cells[goal]);
          if (estimate >= score) continue;
          score = estimate;
          pick = index;
        }
        const current = pending[pick];
        pending[pick] = pending.at(-1);
        pending.pop();
        state[current] = 2;
        const point = cells[current];
        const gap = distance(point, target);
        if (gap < closestDistance || current === goal) {
          closestDistance = gap;
          closest = current;
        }
        if (current === goal) break;

        const col = current % columns;
        const row = Math.floor(current / columns);
        for (const [dx, dz] of adjacent) {
          const x = col + dx;
          const z = row + dz;
          if (x < 0 || x >= columns || z < 0 || z >= rows) continue;
          const id = z * columns + x;
          const nextCost = cost[current] + (dx && dz ? spacing * Math.SQRT2 : spacing);
          if (state[id] === 2 || nextCost >= cost[id] || !walkable(id) || !clear(point, cells[id])) continue;
          cost[id] = nextCost;
          previous[id] = current;
          if (!state[id]) pending.push(id);
          state[id] = 1;
        }
      }

      if (closest === start && !clear(cells[start], target)) return [];
      const route = [];
      for (let id = closest; id !== -1; id = previous[id]) route.push(cells[id]);
      route.reverse();
      if (clear(route.at(-1), target)) route.push(target);

      // Skip grid corners whenever the robot's full width fits on the shortcut.
      const waypoints = [];
      let anchor = from;
      for (let first = 0; first < route.length;) {
        let next = first;
        while (next + 1 < route.length && clear(anchor, route[next + 1])) next++;
        anchor = route[next];
        waypoints.push(anchor);
        first = next + 1;
      }
      return waypoints;
    }
  };
}
