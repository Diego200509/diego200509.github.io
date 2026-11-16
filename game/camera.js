import * as THREE from "../vendor/three.module.min.js";

const clamp = THREE.MathUtils.clamp;

export function createPlayerCamera(camera, collision) {
  const position = new THREE.Vector3();
  const pivot = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const shoulder = new THREE.Vector3();
  const arm = new THREE.Vector3();
  const seatedArm = new THREE.Vector3();
  const desired = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const pose = new THREE.Object3D();
  const gamePose = new THREE.Object3D();
  const from = new THREE.Object3D();
  const device = new THREE.Object3D();
  let thirdPerson = false;
  let armLength = 1;
  let height = 1.68;
  let transition = 1;
  let distance = 0;
  let hasDevice = false;

  function capture() {
    from.position.copy(camera.position);
    from.quaternion.copy(camera.quaternion);
    transition = 0;
  }

  function apply(target, progress) {
    camera.position.lerpVectors(from.position, target.position, progress);
    camera.quaternion.slerpQuaternions(from.quaternion, target.quaternion, progress);
    camera.updateMatrixWorld();
  }

  return {
    position,
    get thirdPerson() { return thirdPerson; },
    get distance() { return distance; },
    toggle() {
      capture();
      armLength = 1;
      thirdPerson = !thirdPerson;
      return thirdPerson;
    },
    update(yaw, pitch, indoors, eyeHeight, dt, instant = false, sitting = 0) {
      height = instant ? eyeHeight : THREE.MathUtils.damp(height, eyeHeight, 15, dt);
      pivot.copy(position).y += height;
      forward.set(-Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
      if (thirdPerson) {
        shoulder.set(Math.cos(yaw), 0, -Math.sin(yaw));
        arm.copy(forward).multiplyScalar(indoors ? -2 : -3.55).addScaledVector(shoulder, indoors ? .48 : .86);
        arm.y = clamp(arm.y + .36, -.48, indoors ? .82 : 1.45);
        if (sitting) {
          seatedArm.copy(forward).multiplyScalar(1.68).addScaledVector(shoulder, 1.27).setY(.36);
          arm.lerp(seatedArm, sitting).addScaledVector(shoulder, Math.sin(sitting * Math.PI) * 1.06);
        }
        desired.copy(pivot).add(arm);
        const available = collision.fraction(pivot, desired, .16);
        armLength = instant || available < armLength ? available : THREE.MathUtils.damp(armLength, available, 8, dt);
        pose.position.copy(pivot).addScaledVector(arm, armLength);
        focus.copy(pivot).addScaledVector(forward, 18 * (1 - sitting) ** 3).y += .14 * sitting;
        pose.lookAt(focus);
        // Object3D looks down +Z. The camera looks down -Z.
        pose.rotateY(Math.PI);
      } else {
        pose.position.copy(pivot);
        pose.rotation.set(pitch, yaw, 0, "YXZ");
      }
      transition = instant ? 1 : Math.min(1, transition + dt * 5);
      apply(pose, 1 - (1 - transition) ** 3);
      const available = collision.fraction(pivot, camera.position, .13);
      camera.position.lerp(pivot, 1 - available);
      camera.updateMatrixWorld();
      distance = camera.position.distanceTo(pivot);
    },
    beginDevice(point, target) {
      gamePose.position.copy(camera.position);
      gamePose.quaternion.copy(camera.quaternion);
      capture();
      device.position.copy(point);
      device.lookAt(target);
      device.rotateY(Math.PI);
      hasDevice = true;
      return collision.fraction(from.position, point, .14) < 1;
    },
    frameDevice(progress, fade) {
      if (!hasDevice) return;
      apply(device, fade ? Number(progress === 1) : 1 - (1 - progress) ** 3);
    },
    returnFromDevice() {
      if (!hasDevice) return;
      hasDevice = false;
      from.copy(gamePose);
      apply(gamePose, 1);
      transition = 1;
    }
  };
}
