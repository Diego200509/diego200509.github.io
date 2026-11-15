const incoming = {
  normal: [1, 0, 1, 0, 0, 1, 0, 0],
  heavy: [2, 1, 1, 1, 1, 2, 1, 0],
  cross: [0, 1, 0, 0, 1, 0, 0, 0]
};

export function newSimulation() {
  return { queues: [3, 2], tick: 0, green: 0, phaseTicks: 0, clearing: false };
}

export function step(state, adaptive, moreTraffic) {
  const arrivalIndex = state.tick % incoming.normal.length;
  state.tick++;
  state.queues[0] += incoming[moreTraffic ? "heavy" : "normal"][arrivalIndex];
  state.queues[1] += incoming.cross[arrivalIndex];
  if (state.clearing) {
    state.green = 1 - state.green;
    state.phaseTicks = 0;
    state.clearing = false;
    return null;
  }

  const other = 1 - state.green;
  if (state.phaseTicks > 0) {
    const activeQueue = state.queues[state.green];
    const waitingQueue = state.queues[other];
    const switchGreen = adaptive
      ? state.phaseTicks >= 8 || (state.phaseTicks >= 3 && waitingQueue > activeQueue + 1)
      : state.phaseTicks >= 4;
    if (switchGreen) {
      state.clearing = true;
      return null;
    }
  }

  const passing = state.queues[state.green] > 0 ? state.green : null;
  state.queues[state.green] = Math.max(0, state.queues[state.green] - 2);
  state.phaseTicks++;
  return passing;
}
