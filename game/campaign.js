export const stations = ["ambacar", "rgb", "talkapp", "traffic", "asotema"];
export const levels = [...stations, "return"];
export const milestones = ["zeus", "rgb", "talkapp", "traffic", "expense", "supply", "supervisor", "power"];
export const campaignKey = "district-campaign";
const rewards = { rgb: "chain", talkapp: "scanner", traffic: "interrupt", supply: "battery" };

export function loadCampaign(storage) {
  let loaded;
  try { loaded = JSON.parse(storage.getItem(campaignKey)); } catch {}
  let state;

  function initial() {
    return { version: 1, awakened: false, station: "ambacar", checkpoint: "ambacar",
      completed: [], emitter: null, upgrades: [], zeusFailed: false, prisms: [], demos: {}, reached: ["ambacar"],
      mural: [100, 100, 100], batteryUsed: false };
  }

  function destination() {
    const next = milestones[state.completed.length];
    return ({ zeus: "ambacar", rgb: "rgb", talkapp: "talkapp", traffic: "traffic",
      expense: "asotema", supply: "asotema", supervisor: "return", power: "return" })[next] ?? "return";
  }

  function unlocked(id) {
    const index = levels.indexOf(id);
    return index >= 0 && index <= levels.indexOf(state.station);
  }

  state = initial();
  if (loaded?.version === 1) {
    // Accept only the contiguous, valid portion of a saved campaign.
    for (const result of milestones) {
      if (!Array.isArray(loaded.completed) || !loaded.completed.includes(result)) break;
      state.completed.push(result);
    }
    state.awakened = loaded.awakened === true || state.completed.length > 0;
    state.zeusFailed = loaded.zeusFailed === true;
    state.emitter = state.completed.includes("zeus") ? (loaded.emitter === "rapid" && !state.zeusFailed ? "rapid" : "basic") : null;
    state.upgrades = state.completed.flatMap(result => rewards[result] ? [rewards[result]] : []);
    state.prisms = state.completed.includes("rgb") ? [0, 1, 2] :
      [0, 1, 2].filter(index => state.emitter && Array.isArray(loaded.prisms) && loaded.prisms.includes(index));
    state.station = destination();
    if (unlocked(loaded.checkpoint)) {
      state.checkpoint = loaded.checkpoint;
    }
    state.reached = levels.filter(id => id === "ambacar" || (unlocked(id) &&
      (id === state.checkpoint || (Array.isArray(loaded.reached) && loaded.reached.includes(id)))));
    for (const id of stations) {
      if (Number.isSafeInteger(loaded.demos?.[id]) && loaded.demos[id] > 0) state.demos[id] = loaded.demos[id];
    }
    if (state.completed.includes("rgb") && Array.isArray(loaded.mural) && loaded.mural.length === 3 &&
        loaded.mural.every(value => Number.isFinite(value) && value >= 0 && value <= 200)) state.mural = loaded.mural;
    state.batteryUsed = state.upgrades.includes("battery") && loaded.batteryUsed === true;
  }

  function save() {
    try { storage.setItem(campaignKey, JSON.stringify(state)); } catch {}
  }

  const done = result => state.completed.includes(result);
  const next = () => milestones[state.completed.length];

  return {
    get state() { return state; },
    get level() { return levels.indexOf(state.station) + 1; },
    unlocked,
    done,
    next,
    reset() { state = initial(); save(); },
    wake() { state.awakened = true; save(); },
    failZeus() {
      if (next() !== "zeus" || state.zeusFailed) return;
      state.zeusFailed = true;
      save();
    },
    collect(index) {
      if (next() !== "rgb" || ![0, 1, 2].includes(index) || state.prisms.includes(index)) return false;
      state.prisms.push(index);
      save();
      return true;
    },
    recordDemo(id) {
      if (!stations.includes(id)) return;
      state.demos[id] = (state.demos[id] ?? 0) + 1;
      save();
    },
    checkpoint(id) {
      if (!unlocked(id) || state.checkpoint === id) return false;
      state.checkpoint = id;
      if (!state.reached.includes(id)) state.reached.push(id);
      save();
      return true;
    },
    travelAllowed(id) {
      return done("zeus") && stations.includes(id) && unlocked(id) && (done("power") || state.reached.includes(id));
    },
    complete(result, data) {
      if (next() !== result || (result === "rgb" && state.prisms.length !== 3)) return false;
      const checkpoint = state.station;
      if (result === "zeus") state.emitter = state.zeusFailed ? "basic" : "rapid";
      if (result === "rgb") state.mural = [...data];
      if (rewards[result]) state.upgrades.push(rewards[result]);
      state.completed.push(result);
      state.checkpoint = checkpoint;
      if (!state.reached.includes(checkpoint)) state.reached.push(checkpoint);
      state.station = destination();
      save();
      return true;
    },
    spendBattery() {
      if (!state.upgrades.includes("battery") || state.batteryUsed) return false;
      state.batteryUsed = true;
      save();
      return true;
    }
  };
}
