import * as THREE from "../vendor/three.module.min.js";

const designs = {
  patrol: { color: "#78908f", hp: 54, scale: 1, speed: 1.8, range: 6, windup: .9, damage: 10 },
  marksman: { color: "#687f9d", hp: 56, scale: 1, speed: 1.45, range: 9, windup: 1.05, damage: 13 },
  armor: { color: "#958c7b", hp: 85, scale: 1.24, speed: 1.48, range: 6.5, windup: 1.12, damage: 14 },
  assault: { color: "#ae795f", hp: 72, scale: 1.17, speed: 2.2, range: 6, windup: 1.13, damage: 19, rush: true },
  supervisor: { color: "#988365", hp: 142, scale: 1.53, speed: 1.65, range: 7.2, windup: 1.35, damage: 23, rush: true }
};
const groups = [
  [["patrol", -2.3, 3.2], ["patrol", 2.2, -.6], ["patrol", -2.1, -2.3]],
  [["patrol", 3.1, -2.2], ["patrol", 4.6, -3.3], ["marksman", 8.4, -4.1]],
  [["armor", 6.8, 4.75], ["marksman", 11, 5.9]],
  [["marksman", -4, 9.1], ["assault", -.6, 12.7], ["marksman", -7.7, 4.75]],
  [["supervisor", -4.6, 13.25], ["patrol", -2.7, 14.1], ["patrol", -5.1, 11.1]]
];
const ammoLimit = 8;
const pulseRange = 28;
const shell = new THREE.BoxGeometry(1, 1, 1);
const moduleShape = new THREE.OctahedronGeometry(.21);
const up = new THREE.Vector3(0, 1, 0);
const front = new THREE.Vector3(0, 0, 1);

export function createCombat(scene, collision, campaign, events) {
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
    const design = designs[id];
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
    const waypoint = new THREE.Vector3(x + (index % 2 ? -1.1 : 1.1), 0, z + .8);
    return { id, index, wave, design, body, chassis, legs, beacon, assembly, home, waypoint, towardHome: false,
      mode: "patrol", timer: 0, scan: 0, hp: design.hp, attack: new THREE.Vector3(), hit: false };
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
    item.life = hostile ? .95 : .11;
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

  function moveRobot(robot, target, speed, dt) {
    const pos = robot.body.position;
    scratchC.subVectors(target, pos).setY(0);
    const length = scratchC.length();
    if (length < .12) return;
    scratchC.multiplyScalar(Math.min(length, speed * dt) / length);
    const x = pos.x + scratchC.x;
    const z = pos.z + scratchC.z;
    if (collision.canStand(x, pos.z, 1.55 * robot.design.scale)) pos.x = x;
    if (collision.canStand(pos.x, z, 1.55 * robot.design.scale)) pos.z = z;
  }

  function updateRobot(robot, position, target, safe, dt) {
    const { body, design } = robot;
    body.visible = (campaign.done("power") || robot.wave === activeWave) && body.position.distanceToSquared(position) < 28 ** 2;
    if (!body.visible) return;
    if (!robot.hp) {
      body.rotation.z = THREE.MathUtils.damp(body.rotation.z, 1.42, 7, dt);
      robot.beacon.color.set("#424d58");
      return;
    }
    robot.timer -= dt;
    robot.scan = Math.max(0, robot.scan - dt);
    const distance = body.position.distanceTo(position);
    core(robot, scratchA);
    const peaceful = campaign.done("power");
    const clearShot = !safe && !peaceful && distance < 13 && collision.fraction(scratchA, target) === 1;
    if (safe || peaceful || (distance > 15 && robot.mode !== "patrol")) robot.mode = "patrol";
    if (robot.mode === "patrol" && clearShot) {
      robot.mode = "detect";
      robot.timer = .42 + robot.index * .3;
    }
    if (robot.mode === "patrol") {
      const point = robot.towardHome ? robot.home : robot.waypoint;
      body.rotation.y = Math.atan2(point.x - body.position.x, point.z - body.position.z);
      moveRobot(robot, point, .65, dt);
      if (point.distanceToSquared(body.position) < .13) robot.towardHome = !robot.towardHome;
    } else if (robot.mode === "detect") {
      if (robot.timer <= 0 && distance < design.range && clearShot) {
        robot.mode = "prepare";
        robot.timer = design.windup;
        if (distance < 10) events.sound("warning");
      } else if (distance > (robot.id === "marksman" ? 7.2 : 3.6)) {
        moveRobot(robot, position, design.speed, dt);
      }
    } else if (robot.mode === "prepare" && robot.timer <= 0) {
      if (design.rush) {
        robot.mode = "rush";
        robot.timer = .68;
        robot.attack.copy(position).sub(body.position).setY(0).normalize().multiplyScalar(7.4).add(body.position);
        robot.hit = false;
      } else {
        if (clearShot) {
          pulse(scratchA, target, 2, true);
          pulses[(nextPulse - 1 + pulses.length) % pulses.length].damage = design.damage;
          events.sound("hostile");
        }
        robot.mode = "recover";
        robot.timer = 1.6 + robot.index * .27;
      }
    } else if (robot.mode === "rush") {
      moveRobot(robot, robot.attack, 7.15, dt);
      if (!robot.hit && distance < 1.45 && clearShot) {
        harm(design.damage, body.position);
        robot.hit = true;
      }
      if (robot.timer <= 0) {
        robot.mode = "recover";
        robot.timer = robot.id === "supervisor" ? 2.8 : 1.8;
      }
    } else if ((robot.mode === "recover" || robot.mode === "stunned") && robot.timer <= 0) {
      robot.mode = "detect";
      robot.timer = .44;
    }
    if (robot.mode !== "patrol" && robot.mode !== "rush") body.rotation.y = Math.atan2(position.x - body.position.x, position.z - body.position.z);
    const warning = robot.mode === "prepare";
    const vulnerable = armored(robot) && moduleOpen(robot);
    attackWarning ||= warning && distance < 9 && clearShot;
    exposed ||= vulnerable && distance < 9 && clearShot;
    robot.assembly.visible = vulnerable;
    robot.chassis.rotation.x = warning && design.rush ? .3 : robot.mode === "rush" ? .49 : 0;
    robot.beacon.color.set(warning ? "#ff633f" : vulnerable ? "#c5fc77" : peaceful ? "#a4f4c6" : robot.mode === "stunned" ? "#8dc4ff" : "#f5c27e");
    robot.legs.forEach((leg, index) => { leg.rotation.x = Math.sin(age * 7 + index * Math.PI) * (robot.mode === "patrol" || robot.mode === "rush" ? .48 : .14); });
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
