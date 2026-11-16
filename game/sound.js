const notes = {
  wake: [[67, 0, .8, "sine"], [112, .82, .28, "triangle"]],
  warning: [[300, 0, .16], [410, .18, .22]],
  fire: [[475, 0, .13]], hit: [[645, 0, .10], [800, .07, .1]],
  cover: [[210, 0, .12, "triangle"]], hostile: [[170, 0, .15, "triangle"]],
  relay: [[220, 0, .16, "triangle"], [560, .12, .2], [750, .22, .29]],
  reload: [[215, 0, .12], [452, .17, .14]], phone: [[470, 0, .11], [690, .17, .16]],
  scan: [[350, 0, .2], [600, .16, .28]],
  prism0: [[440, 0, .28]], prism1: [[554, 0, .28]], prism2: [[659, 0, .28]]
};

export function createDistrictSound() {
  let context;
  let master;
  let level = .55;
  let ambient;
  return {
    start() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      try {
        if (!context) {
          context = new Audio();
          master = context.createGain();
          master.gain.value = level;
          master.connect(context.destination);
          ambient = context.createGain();
          ambient.gain.value = 0;
          ambient.connect(master);
          const hum = context.createOscillator();
          hum.frequency.value = 49;
          hum.connect(ambient);
          hum.start();
        }
        context.resume().catch(() => {});
      } catch {}
    },
    level(value) {
      level = value;
      if (master) master.gain.setTargetAtTime(level, context.currentTime, .025);
    },
    ambience(value) { if (ambient) ambient.gain.setTargetAtTime(value, context.currentTime, .13); },
    cue(id) {
      if (context?.state !== "running" || !notes[id]) return;
      for (const [frequency, delay, duration, type = "sine"] of notes[id]) {
        const time = context.currentTime + delay;
        const tone = context.createOscillator();
        const gain = context.createGain();
        tone.type = type;
        tone.frequency.value = frequency;
        gain.gain.setValueAtTime(.001, time);
        gain.gain.exponentialRampToValueAtTime(.072, time + .018);
        gain.gain.exponentialRampToValueAtTime(.001, time + duration);
        tone.connect(gain).connect(master);
        tone.start(time);
        tone.stop(time + duration);
      }
    }
  };
}
