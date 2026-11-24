const beat = 60 / 76;
const voices = {
  pad: { type: "sine", attack: .58, level: .065 },
  bass: { type: "triangle", attack: .15, level: .085 },
  bell: { type: "sine", attack: .026, level: .13 },
  arp: { type: "triangle", attack: .03, level: .065 },
  pulse: { type: "triangle", attack: .017, level: .15 }
};

// Each chapter shares the same eight-bar phrase. The first four notes carry the theme.
const score = [
  { bass: 38, chord: [50, 57, 64, 65], melody: [[.5, 62], [1.5, 69], [2.5, 65], [3.25, 64]] },
  { bass: 34, chord: [53, 58, 62, 69], melody: [[1, 65], [2.5, 69]] },
  { bass: 41, chord: [53, 60, 65, 67], melody: [[.5, 60], [1.5, 67], [2.5, 69]] },
  { bass: 36, chord: [52, 55, 60, 62], melody: [[1, 64], [2.5, 67], [3.25, 62]] },
  { bass: 38, chord: [53, 57, 62, 64], melody: [[.5, 62], [1.5, 69], [2.5, 65], [3.25, 64]] },
  { bass: 34, chord: [53, 57, 58, 65], melody: [[1, 65], [2, 69], [3, 72]] },
  { bass: 36, chord: [52, 60, 62, 67], melody: [[.5, 67], [1.5, 64], [3, 67]] },
  { bass: 41, chord: [53, 60, 65, 69], melody: [[.5, 69], [1.5, 67], [2.25, 65, 1.65]] }
];
const restoredTonic = { bass: 41, chord: [53, 57, 60, 67], melody: score[0].melody };

const chapters = {
  wake:      { pad: .42, bell: 0,   arp: 0   },
  workshop:  { pad: .58, bell: .23, arp: 0   },
  plaza:     { pad: .73, bell: .48, arp: .10 },
  talkapp:   { pad: .74, bell: .68, arp: .34 },
  traffic:   { pad: .67, bell: .53, arp: .57 },
  asotema:   { pad: .76, bell: .32, arp: .18 },
  return:    { pad: .64, bell: .39, arp: .32 },
  generator: { pad: .64, bell: .53, arp: .22 },
  finale:    { pad: .97, bell: .94, arp: .67 },
  restored:  { pad: .77, bell: .70, arp: .40 }
};

export function createDistrictScore(context, master) {
  let session;
  let volume = .65;

  function ramp(node, value, speed) {
    const now = context.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setTargetAtTime(value, now, speed);
  }

  function note(output, sound, pitch, when, duration, accent = 1) {
    const tone = context.createOscillator();
    const envelope = context.createGain();
    const end = when + duration;
    tone.type = sound.type;
    tone.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(sound.level * accent, when + sound.attack);
    envelope.gain.exponentialRampToValueAtTime(.0001, end - .025);
    envelope.gain.linearRampToValueAtTime(0, end);
    tone.connect(envelope).connect(output);
    tone.start(when);
    tone.stop(end);
  }

  function schedule(run) {
    if (context.state !== "running") return;
    const now = context.currentTime;
    run.nextBeat ??= now + .045;
    // Drop elapsed subdivisions after timer throttling so delayed notes cannot bunch up.
    if (run.nextBeat < now) {
      const elapsed = Math.ceil((now - run.nextBeat) / (beat / 4));
      run.step += elapsed;
      run.nextBeat += elapsed * beat / 4;
    }
    while (run.nextBeat < now + .14) {
      const { layers, step, nextBeat: when } = run;
      const subdivision = step % 16;
      const barIndex = Math.floor(step / 16) % score.length;
      const restored = run.scene === "finale" || run.scene === "restored";
      const bar = restored && barIndex % 4 === 0 ? restoredTonic : score[barIndex];
      if (subdivision === 0) {
        for (const pitch of bar.chord) note(layers.pad, voices.pad, pitch, when, beat * 4.35);
        note(layers.pad, voices.bass, bar.bass, when, beat * 4, .8);
      }
      for (const [offset, pitch, duration = .95] of bar.melody) {
        if (subdivision !== offset * 4) continue;
        note(layers.bell, voices.bell, pitch, when, beat * duration);
        note(layers.bell, voices.bell, pitch + 12, when + beat * .38, beat * .92, .20);
      }
      if (subdivision % 4 === 2) {
        const pitch = bar.chord[Math.floor(subdivision / 4)] + 12;
        note(layers.arp, voices.arp, pitch, when, beat * .43);
      }
      if (subdivision % 4 === 0 || subdivision === 14) {
        const downbeat = subdivision % 8 === 0;
        note(layers.pulse, voices.pulse, bar.bass - Number(downbeat) * 12, when, beat * .34, downbeat ? 1 : .49);
        if (downbeat) note(layers.pulse, voices.pulse, bar.bass + 12, when, beat * .22, .26);
      }
      run.step++;
      run.nextBeat += beat / 4;
    }
  }

  function stop() {
    if (!session) return;
    const { output, timer } = session;
    clearInterval(timer);
    ramp(output, 0, .06);
    // A separate gain per run keeps fading notes from leaking into the next entrance.
    setTimeout(() => output.disconnect(), 340);
    session = undefined;
  }

  function start(scene) {
    const output = context.createGain();
    output.gain.value = 0;
    output.connect(master);
    const layers = {};
    for (const name of ["pad", "bell", "arp", "pulse"]) {
      const layer = context.createGain();
      layer.gain.value = 0;
      layer.connect(output);
      layers[name] = layer;
    }
    const run = { output, layers, scene, step: 0 };
    run.timer = setInterval(() => schedule(run), 35);
    schedule(run);
    return run;
  }

  return {
    level(value) {
      volume = value;
      if (session) ramp(session.output, volume * session.mix, .14);
    },
    update(state) {
      if (!state) { stop(); return; }
      const { scene, threat, ducked } = state;
      if ((scene === "wake" || scene === "finale") && session?.scene !== scene) stop();
      session ??= start(scene);
      if (session.mix !== undefined && session.scene === scene && session.threat === threat && session.ducked === ducked) return;
      const profile = chapters[scene];
      const mix = ducked ? .27 : 1;
      const pulse = ducked ? 0 : threat === 2 ? .92 : threat === 1 ? .57 : 0;
      const { layers } = session;
      ramp(session.output, volume * mix, .19);
      ramp(layers.pad, profile.pad, .38);
      ramp(layers.bell, profile.bell * (1 - .31 * pulse), .38);
      ramp(layers.arp, profile.arp, .38);
      ramp(layers.pulse, pulse, pulse > (session.pulse ?? 0) ? .21 : .75);
      Object.assign(session, { scene, threat, ducked, mix, pulse });
    }
  };
}
