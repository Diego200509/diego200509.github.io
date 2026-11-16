import * as THREE from "../vendor/three.module.min.js";
import { createRobotNavigation } from "./robot-navigation.js";

const designs = {
  patrol: { color: "#78908f", hp: 54, scale: 1, speed: 1.8, sight: 18, range: 8.4, windup: .9, damage: 10 },
  marksman: { color: "#687f9d", hp: 56, scale: 1, speed: 1.45, sight: 22, range: 12.2, windup: 1.05, damage: 13 },
  armor: { color: "#958c7b", hp: 85, scale: 1.24, speed: 1.48, sight: 20, range: 8.8, windup: 1.12, damage: 14 },
  assault: { color: "#ae795f", hp: 72, scale: 1.17, speed: 2.2, sight: 20, range: 7, windup: 1.13, damage: 19, rush: true },
  supervisor: { color: "#988365", hp: 142, scale: 1.53, speed: 1.65, sight: 22, range: 8, windup: 1.35, damage: 23, rush: true }
};
const groups = [
  [["patrol", -2.3, 3.2], ["patrol", 2.2, -.6], ["patrol", -2.1, -2.3]],
  [["patrol", 3.1, -2.2], ["patrol", 4.6, -3.3], ["marksman", 8.4, -4.1]],
  [["armor", 7.15, 4.75], ["marksman", 11, 5.9]],
  [["marksman", -4, 9.1], ["assault", -.6, 12.7], ["marksman", -7.7, 4.75]],
  [["supervisor", -4.6, 13.25], ["patrol", -2.7, 14.1], ["patrol", -5.1, 11.1]]
];
const waveTuning = [
  { health: 1.42, damage: 1.10, pace: 1 },
  { health: 1.62, damage: 1.18, pace: 1.04 },
  { health: 1.82, damage: 1.28, pace: 1.09 },
  { health: 2.02, damage: 1.38, pace: 1.13 },
  { health: 2.16, damage: 1.46, pace: 1.17 }
];
// Outdoor inspection circuits between the forecourts, plaza and crossing.
const maintenanceRoutes = [
  [[-2.8, 4.2], [-7.2, 5.8], [-7.5, 1.6], [-4.3, -3], [0, -6.8], [3.8, -4.9], [6.7, -.9], [3.2, .6]],
  [[7.4, -6.4], [10, -4.6], [10.3, -.5], [9.8, 2.65], [7.15, 6.1], [7.45, 9], [10.6, 11.3], [11.5, 14.3], [4.7, 13.5], [4.2, 8.8]],
  [[-7.9, -3.9], [-10, .05], [-9.8, 4.9], [-8.2, 7.2], [-7.75, 11.45], [-4.1, 12.7], [-2.2, 16.9], [.6, 13], [-1.3, 8.6], [-1.8, 5.9]]
].map(route => route.map(([x, z]) => ({ x, z })));
const ammoLimit = 8;
const pulseRange = 28;
const shell = new THREE.BoxGeometry(1, 1, 1);
const moduleShape = new THREE.OctahedronGeometry(.21);
const up = new THREE.Vector3(0, 1, 0);
const front = new THREE.Vector3(0, 0, 1);

export function createCombat(scene, collision, campaign, events) {
  const navigation = createRobotNavigation(collision);
  const alloy = new THREE.MeshStandardMaterial({ color: "#293845" });
  const shells = Object.fromEntries(Object.entries(designs).map(([id, design]) =>
    [id, new THREE.MeshStandardMaterial({ color: design.color, metalness: .24, roughness: .62 })]));

  function part(parent, width, height, depth, x, y, z, material, geometry = shell) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(width, height, depth);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  const robots = groups.flatMap((group, wave) => group.map(([id, x, z], index) => {
    const base = designs[id];
    const tuning = waveTuning[wave];
    const design = { ...base, hp: Math.round(base.hp * tuning.health), damage: Math.round(base.damage * tuning.damage),
      speed: base.speed * tuning.pace, windup: Math.max(.72, base.windup / tuning.pace), pace: tuning.pace };
    const body = new THREE.Group();
    body.visible = false;
    body.scale.setScalar(design.scale);
    scene.add(body);
    const beacon = new THREE.MeshBasicMaterial({ color: "#ffc784" });
    const chassis = new THREE.Group();
    body.add(chassis);
    part(chassis, .82, .61, .63, 0, .97, 0, shells[id]);
    part(chassis, .58, .3, .47, 0, 1.41, .07, alloy);
    part(chassis, .39, .1, .05, 0, 1.43, .318, beacon);
    const assembly = part(chassis, 1, 1, 1, 0, 1.06, .42, beacon, moduleShape);
    const legs = [-1, 1].map(side => {
      part(chassis, .21, .49, .4, side * .49, .94, .1, alloy);
      return part(body, .22, .58, .36, side * .27, .35, 0, alloy);
    });
    const home = new THREE.Vector3(x, 0, z);
    const waypoint = { x: x + (index % 2 ? -1.1 : 1.1), z: z + .8 };
    const route = maintenanceRoutes[(wave + index) % maintenanceRoutes.length];
    return { id, index, wave, design, body, chassis, legs, beacon, assembly, home, waypoint, towardHome: false,
      mode: "patrol", timer: 0, scan: 0, hp: design.hp, attack: new THREE.Vector3(), hit: false,
      radius: .37 * design.scale, height: 1.51 * design.scale, lastSeen: new THREE.Vector3(), alertUntil: 0,
      path: [], pathIndex: 0, plannedGoal: null, planAt: 0, waitUntil: 0, stalled: 0,
      route, stop: (wave * 2 + index * 3) % route.length, rounds: 0, velocity: 0, stride: .7 * (wave + index), gait: 0 };
  }));

  const pulseGeometry = new THREE.CylinderGeometry(.028, .028, 1, 5);
  const palette = ["#9dffda", "#ffd16d", "#ff9978", "#89b9ff", "#d2b594"].map(color => new THREE.MeshBasicMaterial({ color }));
  const pulses = Array.from({ length: 28 }, () => {
    const mesh = new THREE.Mesh(pulseGeometry, palette[0]);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, life: 0, hostile: false, velocity: new THREE.Vector3(), position: new THREE.Vector3() };
  });

  const line = new THREE.Ray();
  const raycaster = new THREE.Raycaster();
  const center = new THREE.Vector2();
  const sphere = new THREE.Sphere();
  const direction = new THREE.Vector3();
  const intersection = new THREE.Vector3();
  const shotEnd = new THREE.Vector3();
  const crosshairPoint = new THREE.Vector3();
  const muzzle = new THREE.Vector3();
  const scratchA = new THREE.Vector3();
  const scratchB = new THREE.Vector3();
  const scratchC = new THREE.Vector3();
  const visualDirection = new THREE.Vector3();
  const stepPoint = { x: 0, z: 0 };
  const baseStep = { x: 0, z: 0 };
  const sensor = new THREE.Vector3();
  const sightTarget = new THREE.Vector3();
  let nextPulse = 0;
  let age = 0;
  let health = 100;
  let ammo = ammoLimit;
  let reloadTimer = 0;
  let fireTimer = 0;
  let scannerTimer = 0;
  let charging = false;
  let chargeTime = 0;
  let recoil = 0;
  let attackWarning = false;
  let exposed = false;
  let activeWave = -1;

  const armored = robot => robot.id === "armor" || robot.id === "supervisor";
  const moduleOpen = robot => robot.mode === "recover" || robot.mode === "stunned" || robot.scan > 0;

  function pulse(a, b, tint, hostile = false) {
    const item = pulses[nextPulse];
    nextPulse = (nextPulse + 1) % pulses.length;
    item.life = hostile ? 1.18 : .11;
    item.hostile = hostile;
    item.mesh.material = palette[tint];
    item.mesh.visible = true;
    item.position.copy(a);
    visualDirection.subVectors(b, a);
    const length = visualDirection.length();
    visualDirection.normalize();
    item.mesh.position.copy(a).addScaledVector(visualDirection, hostile ? -.24 : length / 2);
    item.mesh.quaternion.setFromUnitVectors(up, visualDirection);
    item.mesh.scale.set(tint === 1 ? 1.8 : 1, hostile ? .48 : Math.max(.04, length), tint === 1 ? 1.8 : 1);
    item.velocity.copy(visualDirection).multiplyScalar(12.5);
  }

  function core(robot, target) {
    return target.copy(front).applyAxisAngle(up, robot.body.rotation.y)
      .multiplyScalar(.45 * robot.design.scale).add(robot.body.position).addScaledVector(up, 1.06 * robot.design.scale);
  }

  function trace(origin, end) {
    const range = origin.distanceTo(end);
    if (range < .001) return { fraction: 0, robot: null, weak: false };
    line.set(origin, direction.subVectors(end, origin).divideScalar(range));
    let fraction = collision.fraction(origin, end);
    let target = null;
    let weak = false;
    for (const robot of robots) {
      if (!robot.body.visible || !robot.hp || campaign.done("power")) continue;
      const scale = robot.design.scale;
      sphere.center.copy(robot.body.position).y += .96 * scale;
      sphere.radius = .64 * scale;
      const shellHit = line.intersectSphere(sphere, intersection);
      if (!shellHit || origin.distanceTo(shellHit) / range > fraction) continue;
      fraction = origin.distanceTo(shellHit) / range;
      target = robot;
      core(robot, sphere.center);
      sphere.radius = .27 * scale;
      weak = moduleOpen(robot) && line.intersectsSphere(sphere);
    }
    return { fraction, robot: target, weak };
  }

  function aim(camera, position, yaw, height) {
    raycaster.setFromCamera(center, camera);
    const ray = raycaster.ray;
    shotEnd.copy(ray.origin).addScaledVector(ray.direction, pulseRange);
    const view = trace(ray.origin, shotEnd);
    crosshairPoint.copy(ray.origin).lerp(shotEnd, view.fraction);
    scratchA.copy(position).y += height - .15;
    muzzle.copy(scratchA).addScaledVector(up, -.04);
    muzzle.x += Math.cos(yaw) * .3 - Math.sin(yaw) * .42;
    muzzle.z -= Math.sin(yaw) * .3 + Math.cos(yaw) * .42;
    muzzle.lerp(scratchA, 1 - collision.fraction(scratchA, muzzle, .04));
    shotEnd.copy(crosshairPoint).addScaledVector(ray.direction, .075);
    const hit = trace(muzzle, shotEnd);
    shotEnd.lerp(muzzle, 1 - hit.fraction);
    return hit;
  }

  function destroy(robot, damage) {
    robot.hp = Math.max(0, robot.hp - damage);
    if (robot.hp) return;
    robot.mode = "offline";
    if (robot.id === "supervisor") events.supervisor();
  }

  function chain(robot) {
    core(robot, scratchA);
    let nearest = null;
    let distance = 3.8;
    for (const other of robots) {
      if (other === robot || !other.body.visible || !other.hp) continue;
      core(other, scratchB);
      const next = scratchB.distanceTo(scratchA);
      if (next >= distance || collision.fraction(scratchA, scratchB) < 1) continue;
      nearest = other;
      distance = next;
    }
    if (!nearest) return;
    core(nearest, scratchB);
    pulse(scratchA, scratchB, 3);
    destroy(nearest, armored(nearest) ? 9 : 23);
  }

  function harm(amount, attacker) {
    if (health <= 0) return;
    health = Math.max(0, health - amount);
    events.damage(attacker);
    if (!health) events.defeat();
  }

  function refill() {
    health = 100;
    ammo = ammoLimit;
    reloadTimer = 0;
  }

  function reload() {
    if (!campaign.state.emitter || ammo === ammoLimit || reloadTimer > 0) return;
    if (!ammo && campaign.spendBattery()) {
      ammo = ammoLimit;
      events.signal("battery");
      return;
    }
    reloadTimer = campaign.state.emitter === "rapid" ? .84 : 1.36;
    events.sound("reload");
  }

  function resetPath(robot) {
    robot.path = [];
    robot.pathIndex = 0;
    robot.plannedGoal = null;
    robot.planAt = 0;
  }

  function turnToward(robot, x, z, dt, rate = 9) {
    if (Math.abs(x) + Math.abs(z) < .0001) return;
    const rotation = robot.body.rotation;
    const difference = Math.atan2(x, z) - rotation.y;
    rotation.y += Math.atan2(Math.sin(difference), Math.cos(difference)) * (1 - Math.exp(-rate * dt));
  }

  function moveRobot(robot, target, speed, dt, avoidPeers = true) {
    const pos = robot.body.position;
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const length = Math.hypot(dx, dz);
    if (length < .025 || !dt) return 0;
    robot.velocity = avoidPeers ? THREE.MathUtils.damp(robot.velocity, speed, 7, dt) : speed;
    const step = Math.min(length, robot.velocity * dt);
    baseStep.x = stepPoint.x = pos.x + dx / length * step;
    baseStep.z = stepPoint.z = pos.z + dz / length * step;
    if (avoidPeers) {
      for (const other of robots) {
        if (other === robot || !other.body.visible || !other.hp) continue;
        const awayX = pos.x - other.body.position.x;
        const awayZ = pos.z - other.body.position.z;
        const gap = Math.hypot(awayX, awayZ);
        const personalSpace = robot.radius + other.radius + .36;
        if (gap < .02 || gap >= personalSpace) continue;
        const push = Math.min(step * .34, (personalSpace - gap) * dt);
        stepPoint.x += awayX / gap * push;
        stepPoint.z += awayZ / gap * push;
      }
    }
    if (!collision.canTraverse(pos, baseStep, robot.height, robot.radius)) return 0;
    const next = avoidPeers && collision.canTraverse(pos, stepPoint, robot.height, robot.radius) ? stepPoint : baseStep;
    const walkX = next.x - pos.x;
    const walkZ = next.z - pos.z;
    turnToward(robot, walkX, walkZ, dt);
    pos.x = next.x;
    pos.z = next.z;
    return Math.hypot(walkX, walkZ);
  }

  function follow(robot, goal, speed, dt) {
    const position = robot.body.position;
    const changed = !robot.plannedGoal || Math.hypot(goal.x - robot.plannedGoal.x, goal.z - robot.plannedGoal.z) > .85;
    if ((changed || robot.pathIndex >= robot.path.length) && age >= robot.planAt) {
      robot.path = navigation.findPath(position, goal, robot.height, robot.radius);
      robot.pathIndex = 0;
      robot.plannedGoal = { x: goal.x, z: goal.z };
      robot.planAt = age + .32 + robot.index * .11;
    }
    let point = robot.path[robot.pathIndex];
    while (point && Math.hypot(position.x - point.x, position.z - point.z) < .13) {
      point = robot.path[++robot.pathIndex];
    }
    if (!point) return 0;
    const moving = moveRobot(robot, point, speed, dt);
    if (!moving && dt) {
      robot.path.length = 0;
      robot.planAt = Math.min(robot.planAt, age + .12);
    }
    return moving;
  }

  function patrol(robot, peaceful, dt) {
    if (age < robot.waitUntil) return 0;
    const position = robot.body.position;
    const point = peaceful ? robot.route[robot.stop] : robot.towardHome ? robot.home : robot.waypoint;
    const gap = Math.hypot(point.x - position.x, point.z - position.z);
    if (gap < .28 || robot.stalled > 1.7 || !collision.canStand(point.x, point.z, robot.height, robot.radius)) {
      robot.towardHome = !robot.towardHome;
      if (peaceful) {
        const direction = robot.index % 2 ? -1 : 1;
        robot.stop = (robot.stop + direction + robot.route.length) % robot.route.length;
        robot.rounds++;
      }
      robot.waitUntil = age + (peaceful ? .45 + ((robot.rounds + robot.wave + robot.index) % 4) * .37 : .23);
      robot.stalled = 0;
      resetPath(robot);
      return 0;
    }
    const speed = peaceful ? 1.06 + ((robot.wave + robot.index) % 4) * .14 : .72;
    const moved = follow(robot, point, Math.min(speed, .35 + gap * 1.8), dt);
    robot.stalled = moved > .0005 ? 0 : robot.stalled + dt;
    return moved;
  }

  function alert(robot, position) {
    robot.lastSeen.copy(position);
    robot.alertUntil = age + 5.5;
    if (robot.mode !== "patrol") return;
    robot.mode = "detect";
    robot.timer = .32 + robot.index * .23;
    robot.waitUntil = 0;
    robot.stalled = 0;
    resetPath(robot);
  }

  function updateRobot(robot, position, target, safe, dt) {
    const { body, design } = robot;
    const peaceful = campaign.done("power");
    body.visible = (peaceful || robot.wave === activeWave) && body.position.distanceToSquared(position) < 28 ** 2;
    if (!body.visible && !peaceful) return;
    if (!robot.hp) {
      body.rotation.z = THREE.MathUtils.damp(body.rotation.z, 1.42, 7, dt);
      robot.beacon.color.set("#424d58");
      return;
    }
    robot.timer -= dt;
    robot.scan = Math.max(0, robot.scan - dt);
    const distance = body.position.distanceTo(position);
    const hostile = !safe && !peaceful;
    sensor.copy(body.position).y += 1.43 * design.scale;
    const seesPlayer = hostile && distance <= design.sight && collision.fraction(sensor, sightTarget) === 1;
    let clearShot = false;
    if (hostile && distance <= design.range) {
      scratchB.copy(body.position).y += 1.06 * design.scale;
      scratchA.subVectors(position, body.position).setY(0).normalize().multiplyScalar(.45 * design.scale).add(scratchB);
      // Test the muzzle in the position it will occupy after turning to fire.
      clearShot = collision.fraction(scratchB, scratchA) === 1 && collision.fraction(scratchA, target) === 1;
    }
    if (seesPlayer || clearShot) alert(robot, position);
    if ((!hostile || (robot.mode === "detect" && age >= robot.alertUntil)) && robot.mode !== "patrol") {
      robot.mode = "patrol";
      robot.alertUntil = 0;
      resetPath(robot);
    }
    let moved = 0;
    let facesPlayer = false;
    if (robot.mode === "patrol") {
      moved = patrol(robot, peaceful, dt);
    } else if (robot.mode === "detect") {
      if (!clearShot) {
        moved = follow(robot, robot.lastSeen, design.speed, dt);
      } else {
        facesPlayer = true;
        if (robot.timer <= 0) {
          robot.mode = "prepare";
          robot.timer = design.windup;
          events.sound("warning");
        }
      }
    } else if (robot.mode === "prepare") {
      facesPlayer = seesPlayer || clearShot;
      if (robot.timer <= 0) {
        if (!clearShot) {
          robot.mode = "detect";
        } else if (design.rush) {
          robot.mode = "rush";
          robot.timer = .76;
          robot.attack.copy(position).sub(body.position).setY(0).normalize().multiplyScalar(8).add(body.position);
          robot.hit = false;
        } else {
          pulse(scratchA, target, 2, true);
          pulses[(nextPulse - 1 + pulses.length) % pulses.length].damage = design.damage;
          events.sound("hostile");
          robot.mode = "recover";
          robot.timer = (1.6 + robot.index * .27) / design.pace;
        }
      }
    } else if (robot.mode === "rush") {
      moved = moveRobot(robot, robot.attack, 7.15 * design.pace, dt, false);
      if (!robot.hit && distance < 1.45 && clearShot) {
        harm(design.damage, body.position);
        robot.hit = true;
      }
      if (robot.timer <= 0 || (!moved && dt)) {
        robot.mode = "recover";
        robot.timer = robot.id === "supervisor" ? 2.8 : 1.8;
      }
    } else if (robot.mode === "recover" || robot.mode === "stunned") {
      facesPlayer = seesPlayer;
      if (robot.timer <= 0) {
        robot.mode = "detect";
        robot.timer = .44;
        resetPath(robot);
      }
    }
    if (facesPlayer) turnToward(robot, position.x - body.position.x, position.z - body.position.z, dt, 12);
    const warning = robot.mode === "prepare";
    const vulnerable = armored(robot) && moduleOpen(robot);
    attackWarning ||= warning && clearShot;
    exposed ||= vulnerable && hostile && (seesPlayer || clearShot);
    robot.assembly.visible = vulnerable;
    robot.chassis.rotation.x = THREE.MathUtils.damp(robot.chassis.rotation.x, warning && design.rush ? .3 : robot.mode === "rush" ? .49 : 0, 11, dt);
    robot.beacon.color.set(warning ? "#ff633f" : vulnerable ? "#c5fc77" : peaceful ? "#a4f4c6" : robot.mode === "stunned" ? "#8dc4ff" : "#f5c27e");
    if (!moved) robot.velocity = THREE.MathUtils.damp(robot.velocity, 0, 9, dt);
    const gait = dt ? Math.min(1, moved / (dt * 1.45)) : robot.gait;
    robot.gait = THREE.MathUtils.damp(robot.gait, gait, 12, dt);
    robot.stride += moved * 6;
    robot.chassis.position.y = Math.abs(Math.sin(robot.stride)) * .034 * robot.gait;
    robot.legs.forEach((leg, index) => {
      const step = Math.sin(robot.stride + index * Math.PI);
      leg.rotation.x = step * .49 * robot.gait;
      leg.position.y = .35 + Math.max(0, step) * .055 * robot.gait;
    });
  }

  return {
    status: () => ({ health, ammo, ammoLimit, reloading: reloadTimer > 0, charging, chargeTime, recoil, attackWarning, exposed }),
    refill,
    reload,
    reset() {
      refill();
      charging = false;
      chargeTime = fireTimer = scannerTimer = recoil = 0;
      for (const item of pulses) { item.mesh.visible = false; item.life = 0; }
      for (const robot of robots) {
        robot.hp = robot.design.hp;
        robot.body.position.copy(robot.home);
        robot.body.rotation.set(0, 0, 0);
        robot.mode = "patrol";
        robot.timer = robot.scan = 0;
        robot.alertUntil = robot.waitUntil = robot.stalled = robot.velocity = robot.gait = 0;
        robot.towardHome = false;
        robot.rounds = 0;
        robot.stop = (robot.wave * 2 + robot.index * 3) % robot.route.length;
        resetPath(robot);
      }
    },
    aim,
    fire(camera, position, yaw, height, charged = false) {
      if (!campaign.state.emitter || !health || fireTimer > 0 || reloadTimer > 0) return;
      if (!ammo) { reload(); return; }
      const hit = aim(camera, position, yaw, height);
      ammo--;
      fireTimer = charged ? .55 : .29;
      recoil = 1;
      pulse(muzzle, shotEnd, charged ? 1 : hit.robot ? 0 : 4);
      events.sound(hit.robot ? "hit" : hit.fraction < .98 ? "cover" : "fire");
      for (const robot of robots) {
        if (robot.wave !== activeWave || !robot.hp) continue;
        if (robot === hit.robot || robot.body.position.distanceToSquared(position) < 12 ** 2) alert(robot, position);
      }
      if (!hit.robot) return;
      const robot = hit.robot;
      if (charged && robot.design.rush) {
        robot.mode = "stunned";
        robot.timer = 2.3;
      }
      destroy(robot, armored(robot) ? (hit.weak ? 46 : charged ? 27 : 12) : charged ? 49 : 34);
      if (campaign.done("rgb")) chain(robot);
    },
    scan(camera, position, yaw, height) {
      if (!campaign.done("talkapp") || scannerTimer > 0) return;
      scannerTimer = 2.5;
      const visible = aim(camera, position, yaw, height).robot;
      if (visible && armored(visible)) {
        visible.scan = 3.8;
        events.signal("exposed");
      }
      events.sound("scan");
    },
    charge(held) {
      const ready = charging && !held && chargeTime >= .56;
      charging = held && campaign.done("traffic");
      chargeTime = 0;
      return ready;
    },
    update(dt, position, height, safe) {
      age += dt;
      fireTimer = Math.max(0, fireTimer - dt);
      recoil = Math.max(0, recoil - dt * 6);
      scannerTimer = Math.max(0, scannerTimer - dt);
      if (reloadTimer > 0) {
        reloadTimer -= dt;
        if (reloadTimer <= 0) ammo = ammoLimit;
      }
      if (charging) chargeTime = Math.min(.56, chargeTime + dt);
      attackWarning = exposed = false;
      activeWave = campaign.done("supervisor") ? -1 :
        ["zeus", "rgb", "talkapp", "traffic", "supply"].findLastIndex(result => campaign.done(result));
      const target = position.clone().addScaledVector(up, height - .35);
      sightTarget.copy(position).y += height - .12;
      for (const robot of robots) {
        updateRobot(robot, position, target, safe, dt);
        if (!health) break;
      }
      for (const item of pulses) {
        if (!item.life) continue;
        item.life = Math.max(0, item.life - dt);
        if (item.hostile) {
          scratchA.copy(item.position).addScaledVector(item.velocity, dt);
          const obstruction = collision.fraction(item.position, scratchA);
          if (obstruction < 1) item.life = 0;
          scratchB.copy(item.position).lerp(scratchA, obstruction);
          if (!safe && !campaign.done("power") && health > 0) {
            const incoming = line.set(item.position, scratchC.copy(item.velocity).normalize());
            sphere.center.copy(target);
            sphere.radius = .44;
            if (incoming.intersectSphere(sphere, intersection) && intersection.distanceTo(item.position) <= scratchB.distanceTo(item.position)) {
              harm(item.damage, item.position);
              item.life = 0;
            }
          }
          item.position.copy(scratchB);
          item.mesh.position.copy(item.position).addScaledVector(item.velocity, -.019);
        }
        item.mesh.visible = item.life > 0;
      }
    }
  };
}
