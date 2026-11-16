import * as THREE from "../vendor/three.module.min.js";
import { createAvatar } from "./avatar.js";
import { createPlayerCamera } from "./camera.js?v=campaign";
import { createCollision } from "./collision.js";
import { createCombat } from "./combat.js";
import { consoles, generator, seat, stand, supply } from "./district-props.js";
import { muralColors } from "./mural.js";
import { buildDistrict } from "./scene.js";
import { workshopLocal, workshopPoint, workshopTerminal, workshopYaw } from "./workshop.js";

const stops = {
  ambacar: { ...workshopPoint(.25, .55), yaw: workshopYaw - .32 },
  rgb: { x: -3.15, z: -5.82, yaw: 0 },
  talkapp: { x: 9.1, z: .1, yaw: -Math.PI / 2 },
  traffic: { x: 7.5, z: 11.95, yaw: 0 },
  asotema: { x: -8.94, z: -.9, yaw: Math.PI / 2 },
  return: { ...workshopPoint(0, 5.45), yaw: -.68 }
};
const zeus = { ...workshopPoint(workshopTerminal.x, workshopTerminal.z - .23), yaw: workshopYaw };
const door = workshopPoint(0, 2.88);
const workshopExit = workshopPoint(0, 3.9);
const eyeStanding = 1.68;
const eyeCrouching = 1.06;
const clamp = THREE.MathUtils.clamp;
const near = (a, b, radius) => Math.hypot(a.x - b.x, a.z - b.z) < radius;
const awakeDuration = 2.9;

export function createWorld(viewport, campaign, callbacks) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(67, 1, .065, 130);
  camera.rotation.order = "YXZ";
  scene.add(camera);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  const touchScreen = matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touchScreen ? 1.25 : 1.6));
  renderer.shadowMap.enabled = !touchScreen;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  viewport.append(renderer.domElement);

  const { lab, traffic, workshop, props, lighting, lanterns, material, setLabels } = buildDistrict(scene);
  const collision = createCollision();
  for (const volume of props.cover) collision.add(...volume);
  for (const [id, { x, z }] of Object.entries(consoles)) {
    collision.add(x, .78, z, id === "asotema" ? .47 : 1.06, 1.56, id === "asotema" ? 1.06 : .47);
  }
  const cars = props.cars.map(car => collision.add(car.position.x, .57, car.position.z, 1.88, 1.13, 1.23));
  const storageGate = collision.add(supply.x + .62, .825, supply.z, .22, 1.65, 1.7);
  const player = createPlayerCamera(camera, collision);
  const avatar = createAvatar(scene);
  const position = player.position;
  const prisms = lab.prisms.map(crystal => crystal.getWorldPosition(new THREE.Vector3()));
  const prismHeight = lab.prisms.map(crystal => crystal.position.y);
  const weapon = new THREE.Group();
  weapon.position.set(.35, -.3, -.58);
  camera.add(weapon);
  for (const [width, height, depth, y, z, color] of [
    [.16, .14, .44, 0, 0, "#465b63"], [.09, .035, .24, .065, -.02, "#8ff9d3"]
  ]) {
    const part = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
    part.position.set(0, y, z);
    weapon.add(part);
  }

  const keys = new Set();
  const touch = new THREE.Vector2();
  const motion = new THREE.Vector3();
  const fromDevice = new THREE.Vector3();
  const deviceScreen = new THREE.Vector3();
  const fogColor = new THREE.Color("#63758b");
  const clearFog = new THREE.Color("#b7ac9c");
  const horizon = new THREE.Color("#57687c");
  const clearHorizon = new THREE.Color("#c79262");
  const zenith = new THREE.Color("#242f49");
  const clearZenith = new THREE.Color("#638ab4");
  const gray = lab.mural.map(entry => entry.tile.material);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let running = false;
  let phase = "explore";
  let phaseTime = 0;
  let time = 0;
  let last = 0;
  let yaw = 0;
  let pitch = -.035;
  let crouchToggle = false;
  let crouching = false;
  let crouchBlend = 0;
  let sprinting = false;
  let sitting = 0;
  let firing = false;
  let aiming = 0;
  let transit;
  let returnTime = 0;
  let restoration = 0;
  let damaged = 0;
  let damageDirection = 0;
  let activeAction = null;
  let previousTarget = "";
  let previousStatus = "";
  let muralState;
  let preparing;
  let phoneNotified = false;

  const combat = createCombat(scene, collision, campaign, {
    sound: callbacks.onSound,
    signal: callbacks.onSignal,
    supervisor: () => complete("supervisor"),
    damage(attacker) {
      damaged = .8;
      const bearings = Math.atan2(attacker.x - position.x, -(attacker.z - position.z)) + yaw;
      damageDirection = THREE.MathUtils.euclideanModulo(Math.round(bearings / (Math.PI / 2)), 4);
    },
    defeat() { setPhase("respawn"); }
  });

  function setPhase(next) {
    phase = next;
    phaseTime = 0;
    if (next !== "explore") clearInput();
    callbacks.onPhase(phase);
  }

  function clearInput() {
    keys.clear();
    touch.set(0, 0);
    firing = false;
    combat.charge(false);
  }

  function playing() { return running && phase === "explore" && !document.hidden; }

  function updateView(dt, instant = false) {
    const local = workshopLocal(position.x, position.z);
    const indoors = Math.abs(local.x) < 3.6 && Math.abs(local.z) < 2.84;
    const height = THREE.MathUtils.lerp(eyeStanding, eyeCrouching, crouchBlend) - sitting * .49;
    player.update(yaw, pitch, indoors, height, dt, instant || reducedMotion.matches, sitting);
    avatar.body.position.copy(position);
    avatar.body.visible = player.thirdPerson && player.distance > .38;
    if (avatar.body.visible) avatar.fade(clamp((player.distance - .35) / .92, 0, 1));
    const status = combat.status();
    weapon.visible = !player.thirdPerson && Boolean(campaign.state.emitter);
    weapon.position.z = -.58 + status.recoil * .12;
    weapon.position.y = -.3 - Number(status.reloading) * .23;
    return height;
  }

  function spawn(id) {
    const point = stops[id] ?? stops.ambacar;
    position.set(point.x, 0, point.z);
    yaw = point.yaw;
    pitch = -.035;
    crouching = crouchToggle = false;
    crouchBlend = 0;
    avatar.body.rotation.y = yaw;
    updateView(0, true);
  }

  function enterWake() {
    position.set(seat.x, 0, seat.z);
    yaw = workshopYaw - .43;
    pitch = -.06;
    sitting = 1;
    avatar.body.rotation.y = yaw;
    setPhase("wake");
    callbacks.onSignal("wake");
    callbacks.onSound("wake");
  }

  function endWake() {
    if (phase !== "wake") return;
    sitting = 0;
    position.set(stand.x, 0, stand.z);
    pitch = -.035;
    campaign.wake();
    callbacks.onVisit("ambacar");
    setPhase("explore");
    updateView(0, reducedMotion.matches);
    reportTarget();
  }

  function isSafe() {
    const room = workshopLocal(position.x, position.z);
    if (Math.abs(room.x) < 3.45 && Math.abs(room.z) < 2.69) return true;
    if (!campaign.done("zeus")) return true;
    return Object.entries(stops).some(([id, spot]) => {
      if (id === "ambacar" || (id !== campaign.state.station && !campaign.state.reached.includes(id))) return false;
      return near(spot, position, id === "return" ? 1.7 : 2.0);
    });
  }

  function reportTarget() {
    const next = campaign.next();
    let action = null;
    let index = null;
    if (phase === "explore" && !returnTime) {
      const inside = workshopLocal(position.x, position.z);
      if (Math.abs(inside.z) < 2.55 && near(position, zeus, 1.67)) action = "zeus";
      else if (!campaign.done("zeus") && near(position, door, 1.65)) action = "lockedDoor";
      else if (next === "rgb" && campaign.state.prisms.length < 3) {
        let distance = 1.55;
        for (const [id, prism] of prisms.entries()) {
          const range = Math.hypot(position.x - prism.x, position.z - prism.z);
          if (campaign.state.prisms.includes(id) || range >= distance) continue;
          distance = range;
          index = id;
          action = "prism";
        }
      } else if ((next === "rgb" || campaign.done("rgb")) && near(position, consoles.rgb, 1.92)) action = "rgb";
      else if ((next === "talkapp" || campaign.done("talkapp")) && near(position, stops.talkapp, 1.95)) action = "talkapp";
      else if ((next === "traffic" || campaign.done("traffic")) && near(position, consoles.traffic, 1.92)) action = "traffic";
      else if (next === "supply" && near(position, supply, .91)) action = "supply";
      else if ((next === "expense" || campaign.done("expense")) && near(position, consoles.asotema, 1.88)) action = "expense";
      else if (next === "power" && near(position, generator, 1.85)) action = "power";
    }
    activeAction = { action, index };
    const safe = isSafe();
    const stage = campaign.state.station;
    if (playing() && !returnTime && stage !== "ambacar" && near(position, stops[stage], 2.0) && campaign.checkpoint(stage)) {
      combat.refill();
      if (stage !== "return") callbacks.onVisit(stage);
      callbacks.onSignal("safe");
    }
    if (playing() && next === "talkapp" && !phoneNotified && near(position, stops.talkapp, 4.3)) {
      phoneNotified = true;
      callbacks.onSignal("phone");
      callbacks.onSound("phone");
      navigator.vibrate?.(70);
    }
    const state = { action, next, prisms: campaign.state.prisms.length,
      phone: (next === "talkapp" && near(position, stops.talkapp, 2)) || (campaign.done("talkapp") && safe) };
    const key = JSON.stringify(state);
    if (previousTarget !== key) {
      previousTarget = key;
      callbacks.onTarget(state);
    }
  }

  function complete(id, data) {
    if (!campaign.complete(id, data)) return false;
    combat.refill();
    const cue = { zeus: campaign.state.emitter, rgb: "chain", talkapp: "scanner", traffic: "interrupt",
      expense: "expense", supply: "supply", power: "power" }[id];
    callbacks.onResult(id, cue);
    if (id === "power") {
      combat.reset();
      setPhase("finish");
      position.set(workshopExit.x, 0, workshopExit.z);
      yaw = stops.return.yaw;
      pitch = .04;
      callbacks.onTransition("teleport");
      updateView(0, true);
    }
    reportTarget();
    return true;
  }

  function interact() {
    if (!playing() || returnTime) return;
    reportTarget();
    const { action, index } = activeAction;
    if (action === "lockedDoor") return;
    if (action === "prism" && campaign.collect(index)) callbacks.onPrism(index);
    if (action === "supply" || action === "power") complete(action);
    if (["zeus", "rgb", "talkapp", "traffic", "expense"].includes(action)) {
      callbacks.onDevice({ zeus: "ambacar", expense: "asotema" }[action] ?? action);
    }
    reportTarget();
  }

  function resize() {
    if (!running || !viewport.clientWidth || !viewport.clientHeight) return;
    camera.aspect = viewport.clientWidth / viewport.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewport.clientWidth, viewport.clientHeight, false);
  }

  function movement(dt) {
    const crouch = crouchToggle || keys.has("ControlLeft") || keys.has("ControlRight");
    crouching = crouch || (crouching && !collision.canStand(position.x, position.z, 1.92));
    crouchBlend = reducedMotion.matches ? Number(crouching) : THREE.MathUtils.damp(crouchBlend, Number(crouching), 14, dt);
    const forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS")) + touch.y;
    const side = Number(keys.has("KeyD")) - Number(keys.has("KeyA")) + touch.x;
    sprinting = !crouching && !firing && aiming <= 0 && forward > .1 &&
      (keys.has("ShiftLeft") || keys.has("ShiftRight") || touch.y > .86);
    const speed = crouching ? 2.45 : sprinting ? 6.75 : 4.45;
    motion.set(side * Math.cos(yaw) - forward * Math.sin(yaw), 0, -side * Math.sin(yaw) - forward * Math.cos(yaw));
    if (motion.lengthSq() === 0) return false;
    motion.clampLength(0, 1).multiplyScalar(dt * speed);
    const { x, z } = position;
    const height = crouching ? 1.23 : 1.92;
    if (collision.canStand(x + motion.x, z, height)) position.x += motion.x;
    if (collision.canStand(position.x, z + motion.z, height)) position.z += motion.z;
    return x !== position.x || z !== position.z;
  }

  function updateDistrict(dt) {
    workshop.update(dt, time * 1000, campaign.done("zeus"), campaign.done("zeus"), reducedMotion.matches);
    collision.door.box.min.y = workshop.doorBottom;
    collision.door.active = workshop.doorVisible;
    props.update(dt, time, campaign, reducedMotion.matches);
    storageGate.active = !campaign.done("expense");
    cars.forEach((car, index) => {
      const x = props.cars[index].position.x;
      car.box.min.x = x - .94;
      car.box.max.x = x + .94;
      car.active = x < 19;
    });
    for (const [index, crystal] of lab.prisms.entries()) {
      crystal.visible = !campaign.state.prisms.includes(index);
      if (!reducedMotion.matches) {
        crystal.rotation.y += dt * .9;
        crystal.position.y = prismHeight[index] + Math.sin(time * 2.2 + index) * .11;
      }
    }
    const isRgb = campaign.done("rgb");
    const mural = isRgb ? campaign.state.mural : null;
    if (muralState !== mural) {
      muralState = mural;
      const colors = mural && muralColors(mural);
      lab.mural.forEach(({ band, tile }, i) => { tile.material = colors ? material(`rgb(${colors[band].join(",")})`) : gray[i]; });
    }
    lab.light.intensity = isRgb ? 17 : 0;
    for (const [index, { lantern, light }] of lanterns.entries()) {
      const flicker = reducedMotion.matches ? .11 : .08 + .22 * Number(Math.sin(time * 2 + index * .74) > .45);
      light.intensity = isRgb ? 10 : flicker * 4;
      lantern.emissiveIntensity = isRgb ? 2 : flicker;
    }
    for (const [index, lamp] of traffic.lamps.entries()) lamp.emissiveIntensity = index === (campaign.done("traffic") ? 2 : 0) ? 1.25 : .06;
    const powered = campaign.done("power");
    restoration = reducedMotion.matches ? Number(powered) : THREE.MathUtils.damp(restoration, Number(powered), .95, dt);
    scene.fog.color.lerpColors(fogColor, clearFog, restoration);
    scene.fog.near = 8 + 15 * restoration;
    scene.fog.far = 37 + 40 * restoration;
    lighting.sky.intensity = 1.08 + .75 * restoration;
    lighting.sun.intensity = .74 + 1.45 * restoration;
    lighting.skyDome.material.uniforms.horizon.value.lerpColors(horizon, clearHorizon, restoration);
    lighting.skyDome.material.uniforms.zenith.value.lerpColors(zenith, clearZenith, restoration);
    lighting.haze.uniforms.strength.value = .29 * (1 - restoration);
    lighting.haze.uniforms.drift.value = reducedMotion.matches ? 0 : time * .12;
    props.lightWindows(restoration);
    const next = campaign.next();
    const beacon = next === "zeus" ? zeus :
      next === "rgb" ? (prisms.find((_, index) => !campaign.state.prisms.includes(index)) ?? consoles.rgb) :
      next === "expense" ? consoles.asotema : next === "supply" ? supply :
      next === "power" ? generator : next === "supervisor" ? stops.return : stops[next];
    props.beacon.visible = Boolean(beacon);
    if (beacon) props.beacon.position.set(beacon.x, 2.15 + (reducedMotion.matches ? 0 : Math.sin(time * 2.4) * .15), beacon.z);
  }

  function reportStatus(height) {
    const { health, ammo, ammoLimit, reloading, charging, chargeTime, attackWarning, exposed } = combat.status();
    let aim = "";
    if (phase === "explore" && campaign.state.emitter && !returnTime) {
      const hit = combat.aim(camera, position, yaw, height);
      aim = hit.weak ? "weak" : hit.robot ? "robot" : hit.fraction < .98 ? "cover" : "";
    }
    const state = { health, ammo, ammoLimit, reloading, charging, charged: chargeTime >= .56, attackWarning, exposed, aim,
      sprinting, crouching, damage: damaged > 0 ? damageDirection : null };
    const key = JSON.stringify(state);
    if (key === previousStatus) return;
    previousStatus = key;
    callbacks.onStatus(state);
  }

  function frame(now) {
    if (!running) return;
    const dt = document.hidden ? 0 : Math.min(Math.max(0, (now - last) / 1000), .05);
    last = now;
    phaseTime += dt;
    if (transit) {
      player.frameDevice(Math.min(1, phaseTime / transit.duration), transit.fade);
    } else if (phase === "wake" || phase === "explore" || phase === "finish" || phase === "respawn") {
      time += dt;
      if (phase === "wake") {
        const rise = clamp((phaseTime - 1.42) / .96, 0, 1);
        sitting = reducedMotion.matches ? 1 : 1 - THREE.MathUtils.smoothstep(rise, 0, 1);
        position.set(THREE.MathUtils.lerp(stand.x, seat.x, sitting), 0, THREE.MathUtils.lerp(stand.z, seat.z, sitting));
        if (phaseTime >= awakeDuration) endWake();
      }
      if (phase === "finish" && phaseTime >= 2.6) setPhase("explore");
      if (phase === "respawn" && phaseTime >= .68) {
        combat.reset();
        damaged = 0;
        spawn(campaign.state.checkpoint);
        callbacks.onTransition("teleport");
        setPhase("explore");
        callbacks.onSignal("respawn");
      }
      const active = playing() && !returnTime;
      const moving = active && movement(dt);
      const height = updateView(dt);
      aiming = Math.max(0, aiming - dt);
      damaged = Math.max(0, damaged - dt);
      if (active || phase === "finish") combat.update(dt, position, height, isSafe());
      if (active && firing) shoot(height);
      const status = combat.status();
      if (avatar.body.visible) {
        const aim = firing || aiming > 0 || status.charging;
        const angle = moving && !aim ? Math.atan2(-motion.x, -motion.z) : yaw;
        const turn = Math.atan2(Math.sin(angle - avatar.body.rotation.y), Math.cos(angle - avatar.body.rotation.y));
        avatar.body.rotation.y += turn * (reducedMotion.matches ? 1 : 1 - Math.exp(-15 * dt));
        avatar.update(dt, moving, reducedMotion.matches, { crouch: crouchBlend, sprint: sprinting, sitting,
          armed: Boolean(campaign.state.emitter), aim, pitch, recoil: status.recoil, reload: Number(status.reloading) });
      }
      updateDistrict(dt);
      returnTime = Math.max(0, returnTime - dt);
      reportTarget();
      reportStatus(height);
    }
    renderer.render(scene, camera);
  }

  function shoot(height, charged = false) {
    aiming = .36;
    combat.fire(camera, position, yaw, height, charged);
  }

  function shootNow(charged = false) {
    if (playing() && !returnTime) shoot(updateView(0), charged);
  }

  window.addEventListener("resize", resize);

  return {
    prepare() {
      preparing ??= renderer.compileAsync(scene, camera).catch(error => { preparing = undefined; throw error; });
      return preparing;
    },
    get phase() { return phase; },
    start() {
      running = true;
      time = 0;
      last = performance.now();
      returnTime = damaged = sitting = aiming = 0;
      restoration = Number(campaign.done("power"));
      phoneNotified = false;
      transit = null;
      previousTarget = previousStatus = "";
      clearInput();
      combat.reset();
      if (campaign.state.awakened) {
        setPhase("explore");
        spawn(campaign.state.checkpoint);
      } else {
        spawn("ambacar");
        enterWake();
        updateView(0, true);
      }
      updateDistrict(1);
      resize();
      frame(last);
      renderer.setAnimationLoop(frame);
    },
    stop() {
      running = false;
      sitting = 0;
      clearInput();
      player.returnFromDevice();
      renderer.setAnimationLoop(null);
    },
    pause(kind, id) {
      if (phase === "explore" || (phase === "device" && kind === "project")) setPhase(kind);
      if (!id || reducedMotion.matches) return 0;
      const device = id === "ambacar" ? zeus : consoles[id];
      if (device) {
        const height = id === "ambacar" ? 1.4 : 1.3;
        deviceScreen.set(device.x + Math.sin(device.yaw) * .087, height, device.z + Math.cos(device.yaw) * .087);
        fromDevice.set(device.x + Math.sin(device.yaw) * .92, height + .17, device.z + Math.cos(device.yaw) * .92);
      } else {
        fromDevice.copy(camera.position);
        camera.getWorldDirection(deviceScreen).add(fromDevice).y -= .27;
      }
      const fade = player.beginDevice(fromDevice, deviceScreen);
      transit = { duration: .28, fade };
      if (fade) callbacks.onTransition("device");
      return 280;
    },
    resume(duration) {
      if (!["device", "map", "project", "settings"].includes(phase)) return;
      transit = null;
      player.returnFromDevice();
      returnTime = duration / 1000;
      setPhase("explore");
      reportTarget();
    },
    moveTo(id) {
      if (!campaign.travelAllowed(id)) return;
      sitting = 0;
      spawn(id);
      campaign.checkpoint(id);
      combat.refill();
    },
    toggleCamera() {
      if (!running || !["wake", "explore"].includes(phase)) return;
      const third = player.toggle();
      if (third) avatar.body.rotation.y = yaw;
      callbacks.onCamera(third);
      if (reducedMotion.matches) updateView(0, true);
    },
    skipWake: endWake,
    clearInput,
    setMove(code, held) {
      if (!held) keys.delete(code);
      else if (playing() && !returnTime) keys.add(code);
    },
    setTouch(x, y) { touch.set(playing() && !returnTime ? x : 0, playing() && !returnTime ? y : 0); },
    crouch() { if (playing() && !returnTime) crouchToggle = !crouchToggle; },
    lookBy(x, y) {
      if (!playing() || returnTime) return;
      yaw = THREE.MathUtils.euclideanModulo(yaw - x * .0035 + Math.PI, Math.PI * 2) - Math.PI;
      pitch = clamp(pitch - y * .0033, -1.12, 1.12);
      updateView(0);
    },
    fire: shootNow,
    holdFire(held) {
      firing = held && playing() && !returnTime;
      if (firing) shootNow();
    },
    reload() { if (playing() && !returnTime) combat.reload(); },
    scan() { if (playing() && !returnTime) combat.scan(camera, position, yaw, updateView(0)); },
    charge(held, cancel = false) {
      if (playing() && !returnTime && combat.charge(held) && !held && !cancel) shootNow(true);
    },
    phone() {
      if (!playing() || returnTime) return;
      reportTarget();
      if ((campaign.next() === "talkapp" && near(position, stops.talkapp, 2)) || (campaign.done("talkapp") && isSafe())) callbacks.onDevice("talkapp");
    },
    interact,
    complete,
    setLabels
  };
}
